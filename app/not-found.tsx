'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex items-center justify-center h-full bg-gray-50">
      <div className="max-w-md space-y-8 p-4 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
          className="flex justify-center"
        >
          <div className="relative">
            <AlertCircle className="h-24 w-24 text-[#86BC29]" />
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 bg-[#86BC29] rounded-full opacity-20"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl">
            Page non trouvée
          </h1>
          <p className="mt-4 text-lg text-gray-500">
            La page que vous recherchez n'existe pas ou a été déplacée. 
            Vérifiez l'URL ou retournez à l'accueil.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="pt-4"
        >
          <Link href="/protected/VueGenerale" className="inline-block"> 
            <Button 
              className="bg-[#86BC29] hover:bg-[#75a625] text-white rounded-full px-8 py-4 text-lg inline-flex items-center justify-center transform transition-all duration-300 hover:shadow-lg"
            >
              <Home className="mr-2 h-5 w-5" />
              Retour à l'accueil
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}