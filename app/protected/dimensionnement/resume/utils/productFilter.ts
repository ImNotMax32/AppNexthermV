
'use client';

import type { Product, FilterCriteria, PowerModel } from '@/app/protected/dimensionnement/resume/types/product';

function getPuissanceDisponibleCascade(
    produit: Product,
    puissanceRequise: number
): PowerModel | null {
    if (!produit.Puissance.increment) return null;

// Arrondir à l'incrément supérieur
    const increment = produit.Puissance.increment;
  const puissanceArrondie = Math.ceil(puissanceRequise / increment) * increment;

  // Vérifier si la puissance est dans la plage possible 
if (puissanceArrondie < produit.Puissance.min || 
        puissanceArrondie > produit.Puissance.max) {
    return null;
    }

    const caract = produit.Puissance.caracteristiques;
    if (!caract) return null;

  // Création du modèle avec la puissance arrondie
    return {
    modele: `${produit.Puissance.baseModele} - ${puissanceArrondie} KW`,
    puissance_calo: puissanceArrondie,
    puissance_frigo: puissanceArrondie * (caract.ratio_frigo || 0.8), // valeur par défaut de 0.8
    puissance_absorbee: puissanceArrondie * (caract.ratio_absorbee || 0.25), // valeur par défaut de 0.25
    cop: caract.cop_moyen,
    etas: caract.etas_moyen
    };
}

export function filterCompatibleProducts(
    products: Product[],
    criteria: FilterCriteria
): Product[] {
console.log("Début du filtrage avec critères:", criteria);

    return products.filter(product => {
    // Vérification de base des critères
    const isTypeCompatible = product.Particularites.includes(criteria.heatPumpType);
    const isSystemCompatible = product.Particularites.includes(criteria.heatPumpSystem);
    const isTempCompatible = 
        criteria.emitterTemp >= product.Emetteur.min && 
        criteria.emitterTemp <= product.Emetteur.max;

    // Si les critères de base ne sont pas remplis, on exclut le produit
    if (!isTypeCompatible || !isSystemCompatible || !isTempCompatible) {
        return false;
    }

    // Vérification de la puissance
    if (product.Puissance.increment) {
      // Cas des produits en cascade
    const modele = getPuissanceDisponibleCascade(product, criteria.heatLoss);
    if (modele) {
        // On met à jour le produit avec le modèle calculé
        product.Puissance.disponibles = [modele];
        return true;
    }
    } else if (product.Puissance.disponibles) {
      // Cas des produits standards
    const modelesOrdonnes = [...product.Puissance.disponibles].sort(
        (a, b) => a.puissance_calo - b.puissance_calo
    );

      // Vérification de la puissance minimale relative
      if (product.Puissance.min > criteria.heatLoss * 1.5) {
        return false;
    }

      // Recherche du premier modèle compatible
        const modeleCompatible = modelesOrdonnes.find(
        modele => modele.puissance_calo >= criteria.heatLoss
    );

    if (modeleCompatible) {
        // On ne garde que le modèle compatible
        product.Puissance.disponibles = [modeleCompatible];
        return true;
    }
    }

    return false;
    });
}