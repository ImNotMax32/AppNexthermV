'use client';

import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  Controls, 
  Background,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { CheckedState } from "@radix-ui/react-checkbox";
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Interfaces
interface PACModel {
  id: string;
  name: string;
  maxZones: number;
  supportsFloorHeating: boolean;
  supportsRadiators: boolean;
  maxTemp: number;
}

interface ZoneType {
  id: string;
  name: string;
  requires: string[];
  maxTemp?: number;
  minTemp?: number;
}

interface DHWConfig {
  type: string;
  requires: string[];
}

interface SafetyComponent {
    id: string;
    name: string;
    position: 'input' | 'output' | 'circuit';
    required: boolean;
    specs?: Record<string, unknown>;
    dependsOn?: string[]; // Composants dont celui-ci dépend
  }

interface SystemConfiguration {
    pacType: string;
    heatingPower: number; // En kW
    zones: Zone[];
    hasDhw: boolean;
    dhwConfig: DHWConfig | null;
    circuitType: 'standard' | 'pool' | 'barrage';
    components: {
      mandatory: SafetyComponent[];
      optional: string[];
    };
  }
  

interface ConfigurationPanelProps {
  onConfigChange: (config: SystemConfiguration) => void;
}

// Configuration système
const SYSTEM_CONFIG = {
  pacTypes: [
    { 
      id: 'smartpack3_std',
      name: 'SMARTPACK 3 Standard',
      maxZones: 2,
      supportsFloorHeating: true,
      supportsRadiators: false,
      maxTemp: 55
    },
    { 
      id: 'smartpack3_ht',
      name: 'SMARTPACK 3 Haute Température',
      maxZones: 2,
      supportsFloorHeating: true,
      supportsRadiators: true,
      maxTemp: 65
    }
  ] as PACModel[],

  bufferTank: {
    capacityPerKw: 15,  // Pour PAC standard
    capacityPerKwHt: 20 // Pour PAC haute température
  },

  zoneTypes: [
    { 
      id: 'floor_heating',
      name: 'Plancher Chauffant',
      requires: ['mixing_valve', 'circ_pump', 'temp_sensor'],
      maxTemp: 35
    },
    { 
      id: 'radiators',
      name: 'Radiateurs',
      requires: ['circ_pump'],
      minTemp: 45
    },
    { 
      id: 'pool',
      name: 'Piscine',
      requires: ['exchanger', 'circ_pump'],
      maxTemp: 30
    }
  ] as ZoneType[],

  mandatorySafetyComponents: [
    {
      id: 'disconnector',
      name: 'Disconnecteur',
      position: 'input',
      required: true
    },
    {
      id: 'decantation',
      name: 'Pot de décantation avec anneau magnétique',
      position: 'input',
      required: true
    },
    {
      id: 'safety_valve',
      name: 'Soupape mano',
      position: 'output',
      required: true,
      count: 2
    }
    
  ] as SafetyComponent[],

  expansionTank: {
    baseCapacity: 8,    // Capacité de base incluse dans la PAC
    extraCapacity: 50,  // Capacité supplémentaire pour certains circuits
    htThreshold: 55     // Seuil de température pour considérer haute température
  },
  
  circuitTypes: [
    {
      id: 'standard',
      name: 'Circuit Direct',
      components: ['ballon_tampon']
    },
    {
      id: 'pool',
      name: 'Circuit Piscine',
      components: ['exchanger', 'v3v', 'pump', 'filter'],
      specs: {
        exchanger: {
          deltaTempPrimary: 8,
          deltaTempSecondary: 6.5
        }
      }
    },
    {
      id: 'barrage',
      name: 'Circuit Échangeur de Barrage',
      components: ['ballon_tampon', 'exchanger']
    }
  ],

  systemComponents: {
    pac: {
      dependencies: ['buffer_tank'], // Le ballon tampon est une dépendance de la PAC
      requiredSafety: ['disconnector', 'decantation', 'safety_valve'] // Composants de sécurité requis
    },
    expansionTank: {
    baseCapacity: 8,    // Capacité de base incluse dans la PAC
    extraCapacity: 50,  // Capacité supplémentaire pour certains circuits
    htThreshold: 55     // Seuil de température pour considérer haute température
  }
  },
} as const;
const calculateBufferTankCapacity = (config: SystemConfiguration): number => {
    const isHighTemp = config.pacType.includes('ht');
    const capacity = isHighTemp ? 
      SYSTEM_CONFIG.bufferTank.capacityPerKwHt : 
      SYSTEM_CONFIG.bufferTank.capacityPerKw;
    return config.heatingPower * capacity;
  };
  
  const calculateExpansionTank = (config: SystemConfiguration): number => {
    const selectedPac = SYSTEM_CONFIG.pacTypes.find(p => p.id === config.pacType);
    const needsExtra = selectedPac?.maxTemp > SYSTEM_CONFIG.expansionTank.htThreshold;
    
    return SYSTEM_CONFIG.expansionTank.baseCapacity + 
      (needsExtra ? SYSTEM_CONFIG.expansionTank.extraCapacity : 0);
  };

// Fonctions utilitaires
const validateConfig = (config: SystemConfiguration): string[] => {
    const errors: string[] = [];
    
    // Validation de la PAC
    const selectedPac = SYSTEM_CONFIG.pacTypes.find(p => p.id === config.pacType);
    if (!selectedPac) {
      errors.push('Veuillez sélectionner un modèle de PAC');
      return errors;
    }
  
    // Validation du nombre de zones
    if (config.zones.length > selectedPac.maxZones) {
      errors.push(`Ce modèle de PAC supporte maximum ${selectedPac.maxZones} zones`);
    }
  
    // Validation de la compatibilité des zones
    config.zones.forEach(zone => {
      const zoneType = SYSTEM_CONFIG.zoneTypes.find(z => z.id === zone.type);
      if (zoneType?.minTemp && selectedPac.maxTemp < zoneType.minTemp) {
        errors.push(`La température maximum de la PAC est insuffisante pour les ${zoneType.name}`);
      }
    });
  
    // Validation des composants de sécurité obligatoires
    SYSTEM_CONFIG.mandatorySafetyComponents.forEach(component => {
      if (component.required && !config.components.mandatory.some(c => c.id === component.id)) {
        errors.push(`${component.name} est requis pour la sécurité du circuit`);
      }
    });
  
    // Validation spécifique au type de circuit
    const circuitConfig = SYSTEM_CONFIG.circuitTypes.find(c => c.id === config.circuitType);
    if (circuitConfig) {
      circuitConfig.components.forEach(comp => {
        if (!config.components.mandatory.some(c => c.id === comp)) {
          errors.push(`${comp} est requis pour un circuit ${circuitConfig.name}`);
        }
      });
    }
  
    // Validation de la puissance
    if (config.heatingPower <= 0) {
      errors.push('La puissance doit être supérieure à 0 kW');
    }
  
    return errors;
  };
  
// Interfaces mises à jour si nécessaire
interface SystemConfiguration {
  pacType: string;
  heatingPower: number;
  zones: Zone[];
  hasDhw: boolean;
  dhwConfig: DHWConfig | null;
  circuitType: 'standard' | 'pool' | 'barrage';
  components: {
    mandatory: SafetyComponent[];
    optional: string[];
  };
}

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({ onConfigChange }) => {
  const [config, setConfig] = useState<SystemConfiguration>({
    pacType: '',
    heatingPower: 10,
    zones: [],
    hasDhw: false,
    dhwConfig: null,
    circuitType: 'standard',
    components: {
      mandatory: [],
      optional: []
    }
  });

  // Fonction pour obtenir les composants requis
  const getRequiredComponents = (pacType: string, power: number): SafetyComponent[] => {
    if (!pacType) return [];

    const bufferTank: SafetyComponent = {
      id: 'buffer_tank',
      name: 'Ballon Tampon',
      position: 'circuit',
      required: true,
      specs: {
        capacity: calculateBufferTankCapacity({ ...config, pacType, heatingPower: power })
      }
    };

    return [
      bufferTank,
      ...SYSTEM_CONFIG.mandatorySafetyComponents
    ];
  };
  const handlePacChange = (pacType: string) => {
    const newConfig: SystemConfiguration = {
      ...config,
      pacType,
      zones: [],
      components: {
        ...config.components,
        mandatory: getRequiredComponents(pacType, config.heatingPower)
      }
    };

    setConfig(newConfig);
    onConfigChange(newConfig);
  };
  
  return (
    <Card className="w-96 p-4">
      <CardHeader>
        <CardTitle>Configuration du Système</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="general">
          <TabsList>
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="zones">Zones</TabsTrigger>
            <TabsTrigger value="components">Composants</TabsTrigger>
            <TabsTrigger value="dhw">ECS</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div>
              <Label>Type de PAC</Label>
              <Select
                value={config.pacType}
                onValueChange={handlePacChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_CONFIG.pacTypes.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {config.pacType && (
              <>
                <div>
                  <Label>Puissance (kW)</Label>
                  <Select
                    value={config.heatingPower.toString()}
                    onValueChange={(value) => {
                      const newPower = parseInt(value);
                      const newConfig: SystemConfiguration = {
                        ...config,
                        heatingPower: newPower,
                        components: {
                          ...config.components,
                          mandatory: getRequiredComponents(config.pacType, newPower)
                        }
                      };
                      setConfig(newConfig);
                      onConfigChange(newConfig);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner la puissance" />
                    </SelectTrigger>
                    <SelectContent>
                      {[6, 8, 10, 12, 14, 16].map((power) => (
                        <SelectItem key={power} value={power.toString()}>
                          {power} kW
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Alert>
                  <AlertDescription>
                    Configuration automatique :
                    <ul className="list-disc pl-4 mt-2">
                      <li>Ballon tampon : {calculateBufferTankCapacity(config)}L</li>
                      <li>Vase d'expansion : {calculateExpansionTank(config)}L</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </>
            )}
          </TabsContent>
  
            <TabsContent value="components" className="space-y-4">
              <div className="space-y-4">
                {config.components.mandatory.map((component) => (
                  <div key={component.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={component.id}
                      checked={true}
                      disabled={true}
                    />
                    <Label htmlFor={component.id}>
                      {component.name}
                      {component.specs?.capacity && ` (${component.specs.capacity}L)`}
                      <span className="text-sm text-muted-foreground ml-2">(Automatique)</span>
                    </Label>
                  </div>
                ))}
              </div>
            </TabsContent>

          <TabsContent value="zones" className="space-y-4">
            {SYSTEM_CONFIG.zoneTypes.map((zoneType) => {
              const pacModel = SYSTEM_CONFIG.pacTypes.find(p => p.id === config.pacType);
              const isCompatible = pacModel && 
                (zoneType.id === 'radiators' ? pacModel.supportsRadiators : true);

              return (
                <div key={zoneType.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={zoneType.id}
                    checked={config.zones.some(z => z.type === zoneType.id)}
                    onCheckedChange={(checked) => {
                      let newZones;
                      if (checked) {
                        newZones = [...config.zones, { type: zoneType.id }];
                      } else {
                        newZones = config.zones.filter(z => z.type !== zoneType.id);
                      }
                      const newConfig = { ...config, zones: newZones };
                      const errors = validateConfig(newConfig);
                      if (errors.length === 0) {
                        setConfig(newConfig);
                        onConfigChange(newConfig);
                      }
                    }}
                    disabled={!config.pacType || !isCompatible}
                  />
                  <Label htmlFor={zoneType.id}>{zoneType.name}</Label>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="safety" className="space-y-4">
            <div className="space-y-4">
              {SYSTEM_CONFIG.mandatorySafetyComponents.map((component) => (
                <div key={component.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={component.id}
                    checked={config.components.mandatory.some(c => c.id === component.id)}
                    disabled={component.required}
                    onCheckedChange={(checked) => {
                      const newMandatory = checked
                        ? [...config.components.mandatory, component]
                        : config.components.mandatory.filter(c => c.id !== component.id);
                      
                      const newConfig = {
                        ...config,
                        components: {
                          ...config.components,
                          mandatory: newMandatory
                        }
                      };

                      const errors = validateConfig(newConfig);
                      if (errors.length === 0) {
                        setConfig(newConfig);
                        onConfigChange(newConfig);
                      }
                    }}
                  />
                  <Label htmlFor={component.id}>
                    {component.name}
                    {component.required && ' (Obligatoire)'}
                  </Label>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="dhw" className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_dhw"
                checked={config.hasDhw}
                onCheckedChange={(checked) => {
                  const newConfig = {
                    ...config,
                    hasDhw: checked === true,
                    dhwConfig: checked ? { type: 'tank_dhw', requires: [] } : null
                  };
                  setConfig(newConfig);
                  onConfigChange(newConfig);
                }}
              />
              <Label htmlFor="has_dhw">Eau Chaude Sanitaire</Label>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

// Composant principal
const HydraulicConfigurator = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const handleConfigChange = useCallback((newConfig: SystemConfiguration) => {
    const newNodes = [];
    const newEdges = [];

    // Ajouter la PAC
    newNodes.push({
      id: 'pac',
      type: 'default',
      position: { x: 100, y: 100 },
      data: { 
        label: `PAC ${newConfig.pacType}`,
        type: newConfig.pacType
      }
    });

    // Ajouter les composants de sécurité
    newConfig.components.mandatory.forEach((component, index) => {
      const position = {
        input: { x: 50, y: 100 + (index * 80) },
        output: { x: 750, y: 100 + (index * 80) },
        circuit: { x: 400, y: 300 + (index * 80) }
      }[component.position];

      newNodes.push({
        id: `safety_${component.id}`,
        type: 'default',
        position,
        data: { 
          label: component.name,
          type: 'safety',
          specs: component.specs
        }
      });
    });

    // Ajouter le ballon tampon si nécessaire
    if (newConfig.circuitType !== 'pool') {
      newNodes.push({
        id: 'buffer',
        type: 'default',
        position: { x: 300, y: 100 },
        data: { 
          label: 'Ballon Tampon',
          capacity: calculateBufferTankCapacity(newConfig)
        }
      });

      newEdges.push({
        id: 'e_pac_buffer',
        source: 'pac',
        target: 'buffer',
        type: 'default'
      });
    }

    // Ajouter les zones
    newConfig.zones.forEach((zone, index) => {
      const zoneX = 500 + (index * 200);
      const zoneY = 100;

      newNodes.push({
        id: `zone_${index}`,
        type: 'default',
        position: { x: zoneX, y: zoneY },
        data: { 
          label: getZoneLabel(zone.type),
          type: zone.type
        }
      });

      // Connecter la zone soit au ballon tampon soit à la PAC selon le circuit
      const sourceId = newConfig.circuitType === 'pool' ? 'pac' : 'buffer';
      newEdges.push({
        id: `e_${sourceId}_zone_${index}`,
        source: sourceId,
        target: `zone_${index}`,
        type: 'default'
      });

      // Ajouter les composants spécifiques à la zone
      if (zone.type === 'pool') {
        const components = [
          { id: 'filter', label: 'Filtre', x: zoneX, y: zoneY + 100 },
          { id: 'pump', label: 'Pompe', x: zoneX + 100, y: zoneY + 100 },
          { id: 'exchanger', label: 'Échangeur', x: zoneX + 200, y: zoneY + 100 }
        ];

        components.forEach((comp) => {
          newNodes.push({
            id: `${zone.type}_${comp.id}_${index}`,
            type: 'default',
            position: { x: comp.x, y: comp.y },
            data: { 
              label: comp.label,
              type: comp.id
            }
          });
        });
      }
    });

    // Ajouter l'ECS si configuré
    if (newConfig.hasDhw && newConfig.dhwConfig) {
      newNodes.push({
        id: 'dhw',
        type: 'default',
        position: { x: 300, y: 300 },
        data: { 
          label: 'ECS',
          type: 'dhw'
        }
      });

      // Ajouter les composants ECS
      const dhwComponents = [
        { id: 'dhw_tank', label: 'Ballon ECS', x: 300, y: 400 },
        { id: 'dhw_pump', label: 'Circulateur ECS', x: 400, y: 400 },
        { id: 'dhw_v3v', label: 'Vanne 3 voies ECS', x: 500, y: 400 }
      ];

      dhwComponents.forEach((comp) => {
        newNodes.push({
          id: comp.id,
          type: 'default',
          position: { x: comp.x, y: comp.y },
          data: { 
            label: comp.label,
            type: 'dhw_component'
          }
        });

        newEdges.push({
          id: `e_dhw_${comp.id}`,
          source: 'dhw',
          target: comp.id,
          type: 'default'
        });
      });

      newEdges.push({
        id: 'e_buffer_dhw',
        source: 'buffer',
        target: 'dhw',
        type: 'default'
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
  }, [setNodes, setEdges]);

  // Fonction utilitaire pour obtenir le label des zones
  const getZoneLabel = (zoneType: string): string => {
    const zoneConfig = SYSTEM_CONFIG.zoneTypes.find(z => z.id === zoneType);
    return zoneConfig ? zoneConfig.name : zoneType;
  };

  return (
    <div className="flex h-screen">
      <ConfigurationPanel onConfigChange={handleConfigChange} />
      <div className="flex-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default HydraulicConfigurator;