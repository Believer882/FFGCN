// Your 6 books
const books = [
  { title: "Biology 1st Paper - Hasan Sir", id: "1NsbEV3RQkojIiKUpuVI1fJ7LZAOU2Fpb" },
  { title: "Biology 2nd Paper - Hasan Sir", id: "1Ne39C6M71wh70PXB3WtcwaPgYxUOIIyL" },
  { title: "Chemistry 1st Paper - Hajari Sir", id: "1Nrh-ArprVZvrfc0ZhPzceE-sXrQ8V3HO" },
  { title: "Chemistry 2nd Paper - Hajari Sir", id: "1NfOv7H707GjndwkBxEMsLjYztjOeYDjM" },
  { title: "Physics 1st Paper", id: "1NlZLMl1S6WpAPY0KWyJw1A8VU-Po71fN" },
  { title: "Physics 2nd Paper", id: "1NjkCjYvIio-EzCfwFHdn_hxM1gHw4UXL" }
];

let currentBook = null;
let currentPage = 0;
let pageImages = [];

// Generate book list
const bookList = document.getElementById('book-list');
books.forEach(book => {
  const card = document.createElement('div');
  card.className = 'book-card';
  card.textContent = book.title;
  card.onclick = () => loadBook(book);
  bookList.appendChild(card);
});

function loadBook(book) {
  currentBook = book;
  const url = `https://drive.google.com/uc?export=download&id=${book.id}`;
  
  document.getElementById('library').style.display = 'none';
  document.getElementById('reader').style.display = 'block';
  document.getElementById('page-container').innerHTML = '<p>Loading book... 📖</p>';

  pdfjsLib.getDocument(url).promise.then(pdf => {
    pageImages = [];
    const loadPages = async () => {
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport }).promise;
        pageImages.push(canvas.toDataURL());
      }
      showPage(0);
    };
    loadPages();
  }).catch(err => {
    document.getElementById('page-container').innerHTML = 
      `<p style="color:red">❌ Failed to load ${book.title}. Check internet or file access.</p>`;
    console.error(err);
  });
}

function showPage(index) {
  if (index < 0 || index >= pageImages.length) return;
  currentPage = index;
  const container = document.getElementById('page-container');
  container.innerHTML = `<img src="${pageImages[index]}" alt="Page ${index + 1}">`;
}

function showLibrary() {
  document.getElementById('reader').style.display = 'none';
  document.getElementById('library').style.display = 'block';
}

// Controls
document.getElementById('prev').onclick = () => {
  if (currentPage > 0) showPage(currentPage - 1);
};
document.getElementById('next').onclick = () => {
  if (currentPage < pageImages.length - 1) showPage(currentPage + 1);
};

// Keyboard
document.addEventListener('keydown', e => {
  if (document.getElementById('reader').style.display !== 'block') return;
  if (e.key === 'ArrowLeft') document.getElementById('prev').click();
  if (e.key === 'ArrowRight') document.getElementById('next').click();
  if (e.key === 'Escape') showLibrary();
});

// PWA Register
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js')
      .catch(console.error);
  });
}
