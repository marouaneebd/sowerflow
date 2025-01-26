'use client'

import { motion, AnimatePresence } from 'framer-motion'
import React from 'react'

interface TransitionProps {
  children: React.ReactNode
  key: string | number
}

export const Transition: React.FC<TransitionProps> = ({ children, key }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={key}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

