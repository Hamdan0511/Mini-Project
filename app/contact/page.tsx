'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'

interface PropertyResult {
  id: string
  title: string
  description: string
  price: number
  currency: string
  price_display: string
  property_type: string
  area_sqft: number | null
  bedrooms: number
  bathrooms: number
  facing?: string
  lat: number
  lon: number
  distance_m: number
  images: string[]
  listing_url: string
  provider: string
  posted_at?: string
  amenities?: string[]
}

interface Filters {
  price: { min: number; max: number; currency: string }
  property_types: string[]
  bedrooms: number[]
  areas: number[]
}

interface Landmark {
  type: string
  name: string
  lat: number
  lon: number
  distance_m: number
}

interface SearchResponse {
  meta: {
    query: string
    city: string
    center: { lat: number; lon: number }
    page: number
    page_size: number
    total_results: number
    sort: string
    source: string
  }
  filters: Filters
  landmarks: Landmark[]
  results: PropertyResult[]
  attribution?: string
  message?: string
  error?: string
}

export default function SearchPage() {

  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<SearchResponse | null>(null)

  const queryParams: Record<string, string> = {}

  searchParams?.forEach((value, key) => {
    queryParams[key] = value
  })

  useEffect(() => {

    async function fetchResults() {

      setLoading(true)
      setError(null)

      try {

        const urlParams = new URLSearchParams(queryParams).toString()

        const res = await fetch(`/api/search?${urlParams}`)
        const json = await res.json()

        if (!res.ok || json.error) {
          setError(json.message || 'Failed to fetch search results.')
          setData(null)
        } else {
          setData(json)
        }

      } catch (err) {
        setError((err as Error).message)
        setData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()

  }, [searchParams])

  if (loading) {
    return <div className="p-6 text-center text-white">Loading search results...</div>
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Error: {error}</div>
  }

  if (!data) {
    return <div className="p-6 text-center text-white">No results found.</div>
  }

  if (data.message) {
    return <div className="p-6 text-center text-yellow-400">{data.message}</div>
  }

  return (

    <div className="flex min-h-screen bg-dark-bg text-white">

      {/* Filters */}
      <aside className="w-1/4 p-4 border-r border-gray-700 sticky top-0 h-screen overflow-y-auto">

        <h2 className="text-xl font-bold mb-4">Filters</h2>

        <p>
          Price Range: {data.filters.price.min} - {data.filters.price.max} {data.filters.price.currency}
        </p>

        <p>
          Property Types: {data.filters.property_types.join(', ')}
        </p>

        <p>
          Bedrooms: {data.filters.bedrooms.join(', ')}
        </p>

        <p>
          Areas: {data.filters.areas.join(', ')}
        </p>

      </aside>

      {/* Results */}
      <main className="flex-1 p-6 overflow-y-auto">

        <h1 className="text-2xl font-bold mb-6">
          Results for &quot;{data.meta.query}&quot; in {data.meta.city} ({data.meta.total_results} listings)
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {data.results.map((property) => (

            <div
              key={property.id}
              className="bg-gray-900 rounded-lg p-4 shadow-lg"
            >

              <Image
                src={property.images?.[0] || '/placeholder.png'}
                alt={property.title}
                width={400}
                height={192}
                className="w-full h-48 object-cover rounded-md mb-2"
              />

              <h3 className="font-semibold text-lg">
                {property.title}
              </h3>

              <p className="text-sm text-gray-300">
                {property.description}
              </p>

              <p className="mt-2 font-bold text-green-400">
                {property.price_display || `${property.currency} ${property.price.toLocaleString()}`}
              </p>

              <a
                href={property.listing_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-sm text-green-500 hover:underline"
              >
                View Listing
              </a>

            </div>

          ))}

        </div>

      </main>

    </div>
  )
}