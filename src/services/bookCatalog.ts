import { Book } from '../types'

/**
 * Busca livros primariamente no Open Library (aberto, sem rate-limit abusivo e gratuito)
 * com fallback para Google Books API.
 */
export async function searchBooks(query: string): Promise<Book[]> {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }

  // 1. Tentar Open Library (Catálogo global aberto)
  try {
    const olUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(
      trimmed
    )}&limit=10`

    const response = await fetch(olUrl)
    if (response.ok) {
      const data = await response.json()
      if (data.docs && Array.isArray(data.docs) && data.docs.length > 0) {
        const books = data.docs.map((doc: any): Book => {
          const coverUrl = doc.cover_i
            ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
            : undefined

          const authors =
            Array.isArray(doc.author_name) && doc.author_name.length > 0
              ? doc.author_name
              : ['Autor desconhecido']

          const publishedYear = doc.first_publish_year
            ? String(doc.first_publish_year)
            : 'N/D'

          const categories =
            Array.isArray(doc.subject) && doc.subject.length > 0
              ? doc.subject.slice(0, 3)
              : []

          let description = ''
          if (doc.first_sentence && Array.isArray(doc.first_sentence) && doc.first_sentence.length > 0) {
            description = `"${doc.first_sentence[0]}"`
          } else {
            description = `${doc.title}, obra de ${authors.join(', ')} publicada originalmente em ${publishedYear}.`
          }

          return {
            id: doc.key ? doc.key.replace('/works/', '') : 'ol_' + Math.random().toString(36).substring(2, 9),
            title: doc.title || 'Título desconhecido',
            authors,
            publishedYear,
            description,
            thumbnail: coverUrl,
            categories,
            language: Array.isArray(doc.language) ? doc.language[0] : undefined,
          }
        })

        if (books.length > 0) {
          return books
        }
      }
    }
  } catch (olError) {
    console.warn('Open Library API offline ou inacessível, tentando fallback:', olError)
  }

  // 2. Fallback: Google Books API (caso Open Library não retorne nada)
  try {
    const gbUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      trimmed
    )}&maxResults=10&printType=books`

    const gbResponse = await fetch(gbUrl)
    if (gbResponse.ok) {
      const data = await gbResponse.json()
      if (data.items && Array.isArray(data.items)) {
        return data.items.map((item: any): Book => {
          const info = item.volumeInfo || {}
          let thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail
          if (thumbnail && thumbnail.startsWith('http://')) {
            thumbnail = thumbnail.replace('http://', 'https://')
          }

          let publishedYear = ''
          if (info.publishedDate) {
            const match = info.publishedDate.match(/^(\d{4})/)
            publishedYear = match ? match[1] : info.publishedDate
          }

          return {
            id: item.id || 'gb_' + Math.random().toString(36).substring(2, 9),
            title: info.title || 'Título desconhecido',
            authors: Array.isArray(info.authors) && info.authors.length > 0 ? info.authors : ['Autor desconhecido'],
            publishedYear: publishedYear || 'N/D',
            description: info.description || 'Sem descrição ou sinopse disponível.',
            thumbnail: thumbnail || undefined,
            categories: Array.isArray(info.categories) ? info.categories : [],
            pageCount: info.pageCount || undefined,
            publisher: info.publisher || undefined,
          }
        })
      }
    }
  } catch (gbError) {
    console.warn('Google Books API fallback falhou:', gbError)
  }

  return []
}

/**
 * Identifica uma obra a partir de texto livre ou busca natural utilizando a IA (Gemini).
 * Exemplo: "o livro da revolução dos animais do george orwell" -> { title: "A Revolução dos Bichos", ... }
 */
export async function identifyBookWithAI(
  query: string,
  apiKey: string
): Promise<Book | null> {
  const trimmed = query.trim()
  if (!trimmed || !apiKey) {
    return null
  }

  const prompt = `Identifique o livro referido pelo usuário: "${trimmed}".
Retorne ESTRITAMENTE um JSON válido com o seguinte formato, sem texto antes ou depois:
{
  "title": "Título oficial em português ou original",
  "authors": ["Nome do Autor"],
  "publishedYear": "Ano de publicação original",
  "description": "Sinopse factual da obra em 2 ou 3 frases",
  "categories": ["Gênero literário"]
}`

  try {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 500,
        },
      }),
    })

    if (!response.ok) return null

    const data = await response.json()
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    
    // Extrai o bloco JSON
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return null

    const parsed = JSON.parse(jsonMatch[0])
    return {
      id: 'ai_' + Math.random().toString(36).substring(2, 9),
      title: parsed.title || trimmed,
      authors: Array.isArray(parsed.authors) && parsed.authors.length > 0 ? parsed.authors : ['Autor desconhecido'],
      publishedYear: parsed.publishedYear || 'N/D',
      description: parsed.description || 'Identificado via IA.',
      categories: Array.isArray(parsed.categories) ? parsed.categories : ['Literatura'],
    }
  } catch (e) {
    console.error('Falha ao identificar livro via IA:', e)
    return null
  }
}
