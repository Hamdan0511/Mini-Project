'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'

interface NavigationProps {
  onNewAnalysis?: () => void
  showNewAnalysisButton?: boolean
}

export default function Navigation({ onNewAnalysis, showNewAnalysisButton = false }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Contact', href: '/contact' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Logo - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-6 left-6 z-50 flex items-center gap-2"
      >
        <Link href="/" className="flex items-center gap-2 group">
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            🌱
          </motion.span>
          <h1
            className="text-5xl font-bold text-neon-green transition-all duration-300"
            style={{
              textShadow: '0 0 20px rgba(0, 255, 153, 0.8), 0 0 40px rgba(0, 255, 153, 0.62)',
            }}
          >
            ΞCΘΣVΛLบΛTΘR
          </h1>
        </Link>
      </motion.div>

      {/* Desktop Navigation - Top Right */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="fixed top-6 right-6 z-50 hidden md:block"
      >
        <div className="flex items-center gap-4">
          {/* New Analysis Button */}
          {showNewAnalysisButton && onNewAnalysis && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onNewAnalysis}
              className="glass-card px-4 py-2 rounded-full text-sm font-medium text-neon-green hover:bg-neon-green/10 transition-all duration-300 border border-neon-green/30 hover:border-neon-green/60 flex items-center gap-2"
              style={{
                boxShadow: '0 0 15px rgba(0, 255, 153, 0.3)',
              }}
            >
              <span>📸</span>
              <span>New Analysis</span>
            </motion.button>
          )}
          
          <ul className="flex items-center gap-8 glass-card px-6 py-3 rounded-full">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`relative text-sm font-medium transition-all duration-300 hover:text-neon-green group ${
                    isActive(link.href) ? 'text-neon-green' : 'text-gray-300'
                  }`}
                >
                  {link.name}
                  <span
                    className={`absolute -bottom-1 left-0 h-[2px] bg-neon-green transition-all duration-300 ${
                      isActive(link.href) ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                    style={{
                      boxShadow: isActive(link.href) ? '0 0 10px rgba(0, 255, 153, 0.8)' : 'none',
                    }}
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </motion.nav>

      {/* Mobile Hamburger Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-6 right-6 z-50 md:hidden glass-card p-3 rounded-lg"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-5 flex flex-col justify-between">
          <motion.span
            animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 8 : 0 }}
            className="w-full h-0.5 bg-neon-green rounded"
            style={{ boxShadow: '0 0 5px rgba(0, 255, 153, 0.8)' }}
          />
          <motion.span
            animate={{ opacity: isOpen ? 0 : 1 }}
            className="w-full h-0.5 bg-neon-green rounded"
            style={{ boxShadow: '0 0 5px rgba(0, 255, 153, 0.8)' }}
          />
          <motion.span
            animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -8 : 0 }}
            className="w-full h-0.5 bg-neon-green rounded"
            style={{ boxShadow: '0 0 5px rgba(0, 255, 153, 0.8)' }}
          />
        </div>
      </motion.button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="absolute right-0 top-0 h-full w-64 glass-card border-l border-neon-green/20"
              style={{
                backdropFilter: 'blur(20px)',
                boxShadow: '0 0 50px rgba(0, 255, 153, 0.1)',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <ul className="flex flex-col gap-6 p-8 mt-20">
                {/* New Analysis Button in Mobile Menu */}
                {showNewAnalysisButton && onNewAnalysis && (
                  <motion.li
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <button
                      onClick={() => {
                        onNewAnalysis()
                        setIsOpen(false)
                      }}
                      className="w-full text-left text-lg font-medium transition-all duration-300 hover:text-neon-green text-neon-green border border-neon-green/30 rounded-lg px-4 py-3 glass-card"
                      style={{
                        textShadow: '0 0 10px rgba(0, 255, 153, 0.8)',
                      }}
                    >
                      📸 New Analysis
                    </button>
                  </motion.li>
                )}
                
                {navLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg font-medium transition-all duration-300 hover:text-neon-green block ${
                        isActive(link.href) ? 'text-neon-green' : 'text-gray-300'
                      }`}
                      style={{
                        textShadow: isActive(link.href)
                          ? '0 0 10px rgba(0, 255, 153, 0.8)'
                          : 'none',
                      }}
                    >
                      {link.name}
                    </Link>
                  </motion.li>
                ))}

              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
