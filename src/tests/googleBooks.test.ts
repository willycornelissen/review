import { describe, it, expect, vi, beforeEach } from 'vitest'
import { searchBooks, searchBookByIsbn, normalizeIsbn } from '../services/googleBooks'

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

describe('searchBookByIsbn service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('valida e normaliza ISBNs de 10 e 13 dígitos com ou sem traços', () => {
    expect(normalizeIsbn('978-85-359-0277-8')).toBe('9788535902778')
    expect(normalizeIsbn('9788535902778')).toBe('9788535902778')
    expect(normalizeIsbn('85-359-0277-5')).toBe('8535902775')
    expect(normalizeIsbn('0-19-852663-X')).toBe('019852663X')
    expect(normalizeIsbn('019852663x')).toBe('019852663X')

    // Casos inválidos
    expect(normalizeIsbn('')).toBeNull()
    expect(normalizeIsbn('12345')).toBeNull()
    expect(normalizeIsbn('livro-qualquer')).toBeNull()
  })

  it('retorna null se o ISBN fornecido for inválido', async () => {
    const book = await searchBookByIsbn('invalido123')
    expect(book).toBeNull()
  })

  it('encontra e mapeia obra pelo ISBN via Open Library Books API', async () => {
    const cleanIsbn = '9788535902778'
    const mockBibResponse = {
      [`ISBN:${cleanIsbn}`]: {
        title: 'A ditadura envergonhada',
        authors: [{ name: 'Elio Gaspari' }],
        publish_date: '2002',
        number_of_pages: 417,
        publishers: [{ name: 'Companhia das Letras' }],
        subjects: [{ name: 'History' }, { name: 'Military government' }],
        cover: {
          medium: 'https://covers.openlibrary.org/b/id/3609103-M.jpg',
        },
      },
    }

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => mockBibResponse,
    } as Response)

    const book = await searchBookByIsbn('978-85-359-0277-8')
    expect(book).not.toBeNull()
    expect(book?.title).toBe('A ditadura envergonhada')
    expect(book?.authors).toEqual(['Elio Gaspari'])
    expect(book?.publishedYear).toBe('2002')
    expect(book?.publisher).toBe('Companhia das Letras')
    expect(book?.pageCount).toBe(417)
    expect(book?.isbn).toBe(cleanIsbn)
  })

  it('trata falha de rede retornando null sem travar a interface', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('Network offline'))
    const book = await searchBookByIsbn('978-85-359-0277-8')
    expect(book).toBeNull()
  })
})
