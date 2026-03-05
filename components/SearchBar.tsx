'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('Bengaluru')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    const params = new URLSearchParams({
      query: query.trim(),
      city: city.trim(),
      min_price: '',
      max_price: '',
      currency: 'INR',
      property_type: '',
      bedrooms: '',
      radius_m: '5000',
      sort: 'price_asc',
      page: '1',
      page_size: '12'
    })
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="w-full max-w-lg mx-auto mt-6 flex gap-2">
      <input
        type="text"
        placeholder="Search locality"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-grow rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500"
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-6 rounded-md hover:bg-green-700 transition-colors duration-200"
      >
        Search
      </button>
    </form>
  )
}
