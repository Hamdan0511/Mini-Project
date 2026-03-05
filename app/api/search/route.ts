import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const propertyApiUrl = process.env.PROPERTY_API_URL
const propertyApiKey = process.env.PROPERTY_API_KEY
const placesApiUrl = process.env.PLACES_API_URL
const placesApiKey = process.env.PLACES_API_KEY
const imageCdnUrl = process.env.IMAGE_CDN || ''

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, options)
  if (!res.ok) {
    const errBody = await res.text()
    throw new Error(`Fetch failed: ${res.status} ${res.statusText} - ${errBody}`)
  }
  return res.json()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('query') || ''
    const city = searchParams.get('city') || ''
    const min_price = searchParams.get('min_price') || ''
    const max_price = searchParams.get('max_price') || ''
    const currency = searchParams.get('currency') || 'INR'
    const property_types = searchParams.getAll('property_type')
    const bedrooms = searchParams.getAll('bedrooms')
    const radius_m = searchParams.get('radius_m') || '5000'
    const sort = searchParams.get('sort') || 'price_asc'
    const page = parseInt(searchParams.get('page') || '1')
    const page_size = parseInt(searchParams.get('page_size') || '12')

    if (!propertyApiUrl || !propertyApiKey || !placesApiUrl || !placesApiKey) {
      return NextResponse.json({ error: 'config_error', message: 'Required API configuration missing' }, { status: 500 })
    }

    // 1. Geocode locality to get lat/lon
    const geocodeUrl = `${placesApiUrl}/geocode?text=${encodeURIComponent(query + ' ' + city)}&apiKey=${placesApiKey}`
    let geocodeData: any
    try {
      geocodeData = await fetchJson(geocodeUrl)
    } catch (err) {
      return NextResponse.json({ error: 'geocode_failed', message: "Couldn't find that locality. Please try a nearby landmark or PIN code." }, { status: 400 })
    }

    const lat = geocodeData?.results?.[0]?.lat ?? 0
    const lon = geocodeData?.results?.[0]?.lon ?? 0

    if (!lat || !lon) {
      return NextResponse.json({ error: 'geocode_failed', message: "Couldn't find that locality. Please try a nearby landmark or PIN code." }, { status: 400 })
    }

    // 2. Call PRIMARY property API
    const propertyQueryParams = new URLSearchParams()
    propertyQueryParams.append('q', query)
    propertyQueryParams.append('city', city)
    propertyQueryParams.append('lat', lat.toString())
    propertyQueryParams.append('lon', lon.toString())
    if (min_price) propertyQueryParams.append('min_price', min_price)
    if (max_price) propertyQueryParams.append('max_price', max_price)
    if (property_types.length) propertyQueryParams.append('type', property_types.join(','))
    if (bedrooms.length) propertyQueryParams.append('bedrooms', bedrooms.join(','))
    propertyQueryParams.append('page', page.toString())
    propertyQueryParams.append('page_size', page_size.toString())
    propertyQueryParams.append('sort', sort)

    let propertyData: any
    let propertyApiName = 'PrimaryPropertyAPI'
    try {
      propertyData = await fetchJson(`${propertyApiUrl}?${propertyQueryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${propertyApiKey}`,
          'Content-Type': 'application/json',
        }
      })
    } catch (err) {
      // Fallback logic or rate limit handling can be implemented here
      return NextResponse.json({ error: 'property_api_error', message: (err as Error).message }, { status: 500 })
    }

    // 3. Fetch nearby landmarks
    const landmarkTypes = ['school', 'hospital', 'train_station', 'mall']
    const placesNearbyUrl = `${placesApiUrl}/nearby?lat=${lat}&lon=${lon}&radius=${radius_m}&types=${landmarkTypes.join('|')}&apiKey=${placesApiKey}`
    let landmarks: any[] = []
    try {
      const placesNearbyData = await fetchJson(placesNearbyUrl)
      landmarks = placesNearbyData?.results || []
    } catch (err) {
      landmarks = []
    }

    // 4. Map property results to output format
    const results = (propertyData?.results || []).map((prop: any) => {
      let images = prop.images || []
      // If no images, try to fetch from IMAGE_CDN if image IDs exist
      if ((!images || images.length === 0) && prop.image_ids && imageCdnUrl) {
        images = prop.image_ids.map((id: string) => `${imageCdnUrl}/image/${id}`)
      } else if (!images || images.length === 0) {
        images = ['/placeholder.png']
      }
      // Format price display
      const priceDisplay = prop.currency === 'INR' ? `₹${prop.price.toLocaleString()}` : `$${prop.price.toLocaleString()}`
      return {
        id: prop.id,
        title: prop.title,
        description: prop.description || '',
        price: prop.price,
        currency: prop.currency || currency,
        price_display: priceDisplay,
        property_type: prop.property_type || null,
        area_sqft: prop.area_sqft || null,
        bedrooms: prop.bedrooms || 0,
        bathrooms: prop.bathrooms || 0,
        facing: prop.facing || null,
        lat: prop.lat,
        lon: prop.lon,
        distance_m: prop.distance_m || 0,
        images: images.slice(0, 6),
        listing_url: prop.listing_url,
        provider: propertyApiName,
        posted_at: prop.posted_at || null,
        amenities: prop.amenities || []
      }
    })

    // Compose the response JSON based on the prompt specification
    const responseBody = {
      meta: {
        query,
        city,
        center: { lat, lon },
        page,
        page_size,
        total_results: propertyData.total_results || results.length,
        sort,
        source: propertyApiName
      },
      filters: {
        price: {
          min: propertyData.filters?.price_min || 0,
          max: propertyData.filters?.price_max || 0,
          currency
        },
        property_types: propertyData.filters?.property_types || [],
        bedrooms: propertyData.filters?.bedrooms || [],
        areas: propertyData.filters?.areas || []
      },
      landmarks: landmarks.map((lm: any) => ({
        type: lm.type,
        name: lm.name,
        lat: lm.lat,
        lon: lm.lon,
        distance_m: lm.distance_m
      })),
      results,
      attribution: `Data provided by ${propertyApiName} and OpenStreetMap`
    }

    return NextResponse.json(responseBody, {
      headers: {
        'Cache-Control': 'public, max-age=60'
      }
    })
  } catch (error) {
    return NextResponse.json({ error: 'internal_error', message: String(error) }, { status: 500 })
  }
}
