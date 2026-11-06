import { Book } from '../types'

export async function searchBooks(query: string): Promise<Book[]> {
  const trimmed = query.trim()
  if (!trimmed) {
    return []
  }

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
      trimmed
    )}&maxResults=10&printType=books`

    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Google Books API error: HTTP ${response.status}`)
      return []
    }

    const data = await response.json()
    if (!data.items || !Array.isArray(data.items)) {
      return []
    }

    return data.items.map((item: any): Book => {
      const info = item.volumeInfo || {}
      
      // Sanitização de thumbnail para HTTPS
      let thumbnail = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail
      if (thumbnail && thumbnail.startsWith('http://')) {
        thumbnail = thumbnail.replace('http://', 'https://')
      }

      // Extração segura do ano de publicação
      let publishedYear = ''
      if (info.publishedDate) {
        const match = info.publishedDate.match(/^(\d{4})/)
        publishedYear = match ? match[1] : info.publishedDate
      }

      return {
        id: item.id || Math.random().toString(36).substring(2, 9),
        title: info.title || 'Título desconhecido',
        authors: Array.isArray(info.authors) && info.authors.length > 0 ? info.authors : ['Autor desconhecido'],
        publishedYear: publishedYear || 'N/D',
        description: info.description || 'Sem descrição ou sinopse disponível.',
        thumbnail: thumbnail || undefined,
        categories: Array.isArray(info.categories) ? info.categories : [],
        pageCount: info.pageCount || undefined,
        publisher: info.publisher || undefined,
        language: info.language || undefined,
      }
    })
  } catch (error) {
    console.error('Falha ao buscar livros na Google Books API:', error)
    return []
  }
}
