'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import PageWrapper from '@/components/PageWrapper'

interface DashboardItem {
  id: string
  title: string
  description: string
  type: 'analysis' | 'report' | 'saved'
  date: string
  status: 'completed' | 'processing' | 'saved'
  coordinates?: { lat: number; lng: number }
  value?: number
}

export default function Dashboard() {
  const [dashboardItems, setDashboardItems] = useState<DashboardItem[]>([])
  const [filter, setFilter] = useState<'all' | 'analysis' | 'report' | 'saved'>('all')
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null)

  // Mock data for demonstration
  useEffect(() => {
    const mockData: DashboardItem[] = [
      {
        id: '1',
        title: 'Forest Property Analysis',
        description: 'Comprehensive environmental assessment of forest land in Northern region',
        type: 'analysis',
        date: '2024-01-15',
        status: 'completed',
        coordinates: { lat: 45.5, lng: -122.3 },
        value: 250000
      },
      {
        id: '2',
        title: 'Urban Development Report',
        description: 'Eco-friendly development potential analysis for city center property',
        type: 'report',
        date: '2024-01-12',
        status: 'completed',
        coordinates: { lat: 40.7, lng: -74.0 },
        value: 850000
      },
      {
        id: '3',
        title: 'Agricultural Land Assessment',
        description: 'Saved analysis of farmland with irrigation potential',
        type: 'saved',
        date: '2024-01-10',
        status: 'saved',
        coordinates: { lat: 35.2, lng: -119.3 },
        value: 120000
      },
      {
        id: '4',
        title: 'Coastal Property Evaluation',
        description: 'Environmental impact assessment for beachfront development',
        type: 'analysis',
        date: '2024-01-08',
        status: 'processing',
        coordinates: { lat: 33.7, lng: -118.2 },
        value: 1200000
      }
    ]
    setDashboardItems(mockData)
  }, [])

  const filteredItems = dashboardItems.filter(item =>
    filter === 'all' || item.type === filter
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'processing': return 'text-yellow-400'
      case 'saved': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'analysis': return '📊'
      case 'report': return '📋'
      case 'saved': return '💾'
      default: return '📄'
    }
  }

  return (
    <>
      <Navigation />
      <PageWrapper>
        <div className="min-h-screen bg-dark-bg pt-24 pb-12">
          <div className="max-w-7xl mx-auto px-6">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-neon-green mb-4">
                Dashboard
              </h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Manage your environmental assessments and property evaluations
              </p>
            </motion.div>

            {/* Filter Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-4 mb-8"
            >
              {[
                { key: 'all', label: 'All Items', icon: '📁' },
                { key: 'analysis', label: 'Analyses', icon: '📊' },
                { key: 'report', label: 'Reports', icon: '📋' },
                { key: 'saved', label: 'Saved', icon: '💾' }
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() => setFilter(filterOption.key as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full glass-card transition-all duration-300 ${
                    filter === filterOption.key
                      ? 'bg-neon-green/20 border-neon-green/50 text-neon-green'
                      : 'text-gray-300 hover:text-neon-green hover:bg-neon-green/10'
                  }`}
                >
                  <span>{filterOption.icon}</span>
                  <span>{filterOption.label}</span>
                </button>
              ))}
            </motion.div>

            {/* Dashboard Items Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="glass-card p-6 hover:bg-neon-green/5 transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getTypeIcon(item.type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-neon-green transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-400">{item.date}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {item.description}
                  </p>

                  {item.coordinates && (
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <span>📍</span>
                      <span>{item.coordinates.lat.toFixed(2)}, {item.coordinates.lng.toFixed(2)}</span>
                    </div>
                  )}

                  {item.value && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Estimated Value:</span>
                      <span className="text-lg font-bold text-neon-green">
                        ${item.value.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="flex-1 bg-neon-green/20 hover:bg-neon-green/30 text-neon-green py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300"
                    >
                      View Details
                    </button>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-all duration-300">
                      ⋯
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Empty State */}
            {filteredItems.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16"
              >
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-2xl font-bold text-gray-300 mb-2">No items found</h3>
                <p className="text-gray-400 mb-6">
                  {filter === 'all'
                    ? "You haven't created any analyses yet. Start by uploading a property image!"
                    : `No ${filter} items found. Try a different filter.`
                  }
                </p>
                <button className="bg-neon-green hover:bg-neon-green/80 text-black px-8 py-3 rounded-lg font-semibold transition-all duration-300">
                  Start New Analysis
                </button>
              </motion.div>
            )}

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6"
            >
              {[
                { label: 'Total Analyses', value: dashboardItems.filter(i => i.type === 'analysis').length, icon: '📊' },
                { label: 'Reports Generated', value: dashboardItems.filter(i => i.type === 'report').length, icon: '📋' },
                { label: 'Saved Items', value: dashboardItems.filter(i => i.type === 'saved').length, icon: '💾' },
                { label: 'Total Value Assessed', value: `$${(dashboardItems.reduce((sum, item) => sum + (item.value || 0), 0) / 1000000).toFixed(1)}M`, icon: '💰' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 * index }}
                  className="glass-card p-6 text-center"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="text-2xl font-bold text-neon-green mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Details Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-dark-bg border border-gray-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{getTypeIcon(selectedItem.type)}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedItem.title}</h2>
                      <p className="text-sm text-gray-400">{selectedItem.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-neon-green mb-2">Description</h3>
                    <p className="text-gray-300">{selectedItem.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-neon-green mb-2">Type</h3>
                      <p className="text-gray-300 capitalize">{selectedItem.type}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-neon-green mb-2">Status</h3>
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedItem.status)} bg-opacity-20`}>
                        {selectedItem.status}
                      </span>
                    </div>
                  </div>

                  {selectedItem.coordinates && (
                    <div>
                      <h3 className="text-lg font-semibold text-neon-green mb-2">Location</h3>
                      <div className="flex items-center gap-2 text-gray-300">
                        <span>📍</span>
                        <span>Latitude: {selectedItem.coordinates.lat.toFixed(4)}, Longitude: {selectedItem.coordinates.lng.toFixed(4)}</span>
                      </div>
                    </div>
                  )}

                  {selectedItem.value && (
                    <div>
                      <h3 className="text-lg font-semibold text-neon-green mb-2">Estimated Value</h3>
                      <p className="text-2xl font-bold text-neon-green">${selectedItem.value.toLocaleString()}</p>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex gap-4">
                  <button className="flex-1 bg-neon-green hover:bg-neon-green/80 text-black px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    Download Report
                  </button>
                  <button className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300">
                    Edit
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </PageWrapper>
    </>
  )
}
