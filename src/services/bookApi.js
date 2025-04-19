import axios from 'axios';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes?q=';
const OPEN_LIBRARY_API = 'https://openlibrary.org/search.json?q=';

export async function fetchBookData(bookName) {
    try {
        const [googleResponse, openLibraryResponse] = await Promise.allSettled([
            axios.get(`${GOOGLE_BOOKS_API}${encodeURIComponent(bookName)}`),
            axios.get(`${OPEN_LIBRARY_API}${encodeURIComponent(bookName)}&limit=5`)
        ]);

        const googleBooks = googleResponse.value?.data?.items || [];
        const openLibraryBooks = openLibraryResponse.value?.data?.docs || [];

        // Processa Google Books
        const matchingGoogleBooks = googleBooks.filter(item => {
            const volumeTitle = item.volumeInfo?.title?.toLowerCase() || '';
            return volumeTitle.includes(bookName.toLowerCase());
        });

        // Processa OpenLibrary se não houver resultados do Google
        let mainBook = {};
        if (matchingGoogleBooks.length > 0) {
            mainBook = matchingGoogleBooks[0].volumeInfo;
        } else if (openLibraryBooks.length > 0) {
            const olBook = openLibraryBooks[0];
            mainBook = {
                title: olBook.title || '',
                authors: olBook.author_name || [],
                categories: olBook.subject?.slice(0, 5) || [],
                description: Array.isArray(olBook.first_sentence) 
                    ? olBook.first_sentence.join(' ') 
                    : olBook.first_sentence || '',
                pageCount: olBook.number_of_pages_median || null,
                averageRating: 0
            };
        }

        // Coleta capas
        const googleCovers = matchingGoogleBooks
            .map(item => item.volumeInfo?.imageLinks?.thumbnail?.replace('http://', 'https://'))
            .filter(Boolean);

        const openLibraryCovers = openLibraryBooks
            .map(book => book.cover_edition_key 
                ? `https://covers.openlibrary.org/b/olid/${book.cover_edition_key}-L.jpg` 
                : null)
            .filter(Boolean);

        return {
            title: mainBook.title || '',
            authors: mainBook.authors ? mainBook.authors.join(', ') : '',
            genres: mainBook.categories ? mainBook.categories.join(', ') : '',
            description: mainBook.description || '',
            pageCount: Number.isInteger(mainBook.pageCount) ? mainBook.pageCount : null,
            averageRating: mainBook.averageRating || 0,
            images: [...new Set([...googleCovers, ...openLibraryCovers])]
        };

    } catch (error) {
        console.error('Erro ao buscar dados do livro:', error);
        return null;
    }
}