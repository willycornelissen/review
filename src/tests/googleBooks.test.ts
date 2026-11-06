import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchBooks } from '../services/googleBooks'

describe('searchBooks service (Open Library + Fallback)', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('retorna array vazio quando a query for vazia ou conter apenas espaços', async () => {
    const resultsEmpty = await searchBooks('')
    const resultsSpaces = await searchBooks('   ')
    expect(resultsEmpty).toEqual([])
    expect(resultsSpaces).toEqual([])
  })

  it('mapeia os dados do Open Library para o tipo Book corretamente', async () => {
    const mockOlResponse = {
      docs: [
        {
          key: '/works/OL1003040W',
          title: 'Dom Casmurro',
          author_name: ['Machado de Assis'],
          first_publish_year: 1899,
          cover_i: 647501,
          subject: ['Ficção', 'Literatura Brasileira'],
          first_sentence: ['Uma noite destas, vindo da cidade para o Engenho Novo...'],
        },
      ],
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockOlResponse,
    } as Response)

    const books = await searchBooks('Dom Casmurro')
    expect(books).toHaveLength(1)
    expect(books[0].title).toBe('Dom Casmurro')
    expect(books[0].authors).toEqual(['Machado de Assis'])
    expect(books[0].publishedYear).toBe('1899')
    expect(books[0].thumbnail).toBe('https://covers.openlibrary.org/b/id/647501-M.jpg')
    expect(books[0].description).toContain('Uma noite destas')
  })

  it('trata falha de rede retornando array vazio sem quebrar a aplicação', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'))
    const books = await searchBooks('Qualquer Livro')
    expect(books).toEqual([])
  })
})
