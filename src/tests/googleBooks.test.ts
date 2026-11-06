import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchBooks } from '../services/googleBooks'

describe('searchBooks service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna array vazio quando a query for vazia ou conter apenas espaços', async () => {
    const resultsEmpty = await searchBooks('')
    const resultsSpaces = await searchBooks('   ')
    expect(resultsEmpty).toEqual([])
    expect(resultsSpaces).toEqual([])
  })

  it('mapeia os dados da Google Books API para o tipo Book corretamente', async () => {
    const mockApiResponse = {
      items: [
        {
          id: 'test-123',
          volumeInfo: {
            title: 'Dom Casmurro',
            authors: ['Machado de Assis'],
            publishedDate: '1899',
            description: 'Clássico da literatura brasileira sobre ciúmes e traição.',
            imageLinks: {
              thumbnail: 'http://books.google.com/books/content?id=123',
            },
            categories: ['Ficção', 'Literatura Brasileira'],
          },
        },
      ],
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiResponse,
    } as Response)

    const books = await searchBooks('Dom Casmurro')
    expect(books).toHaveLength(1)
    expect(books[0].title).toBe('Dom Casmurro')
    expect(books[0].authors).toEqual(['Machado de Assis'])
    expect(books[0].publishedYear).toBe('1899')
    // Verifica que http foi convertido para https
    expect(books[0].thumbnail).toBe('https://books.google.com/books/content?id=123')
  })

  it('trata erros da API retornando array vazio sem lançar exceção', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network error'))
    const books = await searchBooks('Qualquer Livro')
    expect(books).toEqual([])
  })
})
