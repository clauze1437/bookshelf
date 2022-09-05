const books = []; // empty array untuk menampung data buku
const RENDER_EVENTS = "render-book"; // even render book disimpan melalui RENDER_EVENTS
const STORAGE_KEY = "BOOKS_APPS"; // nama event custom yang disimpan ke var STORAGE_KEY

// start the page when load browser
document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("inputBookTitle");
  const author = document.getElementById("inputBookAuthor");
  const year = document.getElementById("inputBookYear");
  const bookSubmitBook = document.getElementById("bookSubmit");

  document.getElementById("inputBook").addEventListener("input", () => {
    if (title.value !== "" && author.value !== "" && year.value !== "") {
      bookSubmitBook.removeAttribute("disabled");
      bookSubmitBook.style.backgroundColor = "cornflowerblue";
    } else {
      bookSubmitBook.setAttribute("disabled", "");
      bookSubmitBook.style.backgroundColor = `#aeaeae`;
    }
  });

  
  document.getElementById("inputBook").addEventListener("submit", (e) => {
    e.preventDefault();
    const bookID = document.getElementById("bookId");
    if (bookID.value !== "") {
      updateBook();
      bookID.removeAttribute('value')
    } else {
      createBook();
    }

    bookSubmitBook.setAttribute("disabled", "");
    bookSubmitBook.style.backgroundColor = `#aeaeae`;
    e.target.reset();
  });

  document.getElementById("searchBookTitle").addEventListener("keyup", (e) => {
    const list = e.target.value.toLowerCase();
    let keyword = document.querySelectorAll(".book_item");
    keyword.forEach((book) => {
      const buku = book.firstChild.textContent.toLocaleLowerCase();
      if (buku.indexOf(list) != -1) {
        book.setAttribute("style", "display: block;");
      } else {
        book.setAttribute("style", "display: none !important;");
      }
    });
  });

  document.getElementById("searchBook").addEventListener("submit", (e) => {
    e.preventDefault();
  });

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

document.addEventListener(RENDER_EVENTS, () => {
  const inCompleted = document.getElementById("incompleteBookshelfList");
  inCompleted.innerHTML = "";

  const completed = document.getElementById("completeBookshelfList");
  completed.innerHTML = "";

  for (const book of books) {
    const bookElement = makeBook(book);
    if (book.isCompleted) {
      completed.append(bookElement);
    } else {
      inCompleted.append(bookElement);
    }
  }

  saveData();
});

const createBook = () => {
  const formBook = getValueInputBook();
  const book = {
    id: generateId(),
    title: formBook.title,
    author: formBook.author,
    year: formBook.year,
    isCompleted: formBook.isCompleted,
  };

  books.push(book);
  Swal.fire({
    icon: "success",
    title: "Data saved successfully!",
    html: `Buku <bold>${formBook.title}</bold> berhasil ditambahkan dan disimpan ke Local Storage!`,
  });
  document.dispatchEvent(new Event(RENDER_EVENTS));
};

const editBook = (id) => {
  const book = books.find((book) => book.id === id);
  document.getElementById("bookId").value = book.id;
  document.getElementById("inputBookTitle").value = book.title;
  document.getElementById("inputBookAuthor").value = book.author;
  document.getElementById("inputBookYear").value = book.year;
  document.getElementById("inputBookIsComplete").checked = book.isCompleted;
  document.getElementById("bookSubmit").innerText = "Edit Book";
  document.getElementById("bookSubmit").removeAttribute("disabled");
  document.getElementById("bookSubmit").style.backgroundColor = `#8464ed`;
};

const updateBook = () => {
  const formBook = getValueInputBook();

  const index = books.findIndex((book) => book.id === parseInt(formBook.id));
  books[index] = {
    ...books[index],
    title: formBook.title,
    author: formBook.author,
    year: formBook.year,
    isCompleted: formBook.isCompleted,
  };

  Swal.fire({
    icon: "success",
    title: "Data updated successfully!",
    html: `Buku <bold>${formBook.title}</bold> telah diupdate dan disimpan ke Local Storage!`,
  });
  document.dispatchEvent(new Event(RENDER_EVENTS));
  formBook.button.innerHTML =
    "Masukkan Buku ke rak <bold>Belum selesai dibaca</bold>";
};

const destroyBook = (id) => {
  Swal.fire({
    title: "Anda yakin?",
    text: "Anda tidak dapat mengembalikannya lagi!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire(
        "Data berhasil dihapus!",
        "Data anda telah dihapus.",
        "success"
      );
      const bookTarget = books.findIndex((book) => book.id === id);
      books.splice(bookTarget, 1);
      document.dispatchEvent(new Event(RENDER_EVENTS));
    }
  });

  document.getElementById("inputBook").reset();
  document.getElementById("bookId").removeAttribute("value");
  document.getElementById("bookSubmit").innerHTML =
    "Masukkan Buku ke rak <bold>Belum selesai dibaca</bold>";
  document.getElementById("bookSubmit").setAttribute("disabled", "");
  document.getElementById("bookSubmit").style.backgroundColor = `grey;`;
};

const toggleBook = (id) => {
  const book = books.find((book) => book.id === id);
  book.isCompleted = !book.isCompleted;
  document.dispatchEvent(new Event(RENDER_EVENTS));
};

const generateId = () => {
  return +new Date();
};

const getValueInputBook = () => {
  const formBook = {};
  formBook["id"] = document.getElementById("bookId").value;
  formBook["title"] = document.getElementById("inputBookTitle").value;
  formBook["author"] = document.getElementById("inputBookAuthor").value;
  formBook["year"] = document.getElementById("inputBookYear").value;
  formBook["isCompleted"] = document.getElementById(
    "inputBookIsComplete"
  ).checked;
  formBook["button"] = document.getElementById("bookSubmit");

  return formBook;
};

const makeBook = (book) => {
  const title = document.createElement("h3");
  title.innerText = book.title;

  const author = document.createElement("p");
  author.innerText = `Penulis: ${book.author}`;

  const year = document.createElement("p");
  year.innerText = `Tahun: ${book.year}`;

  const divButton = document.createElement("div");
  divButton.classList.add("action");

  const editButton = document.createElement("button");
  editButton.classList.add("btn_warning");
  editButton.innerHTML = `<i class="fa-solid fa-pen"></i> Edit`;

  editButton.addEventListener("click", () => {
    editBook(book.id);
  });

  const deleteButton = document.createElement("button");
  deleteButton.classList.add("btn_danger");
  deleteButton.innerHTML = `<i class="fa-solid fa-trash"></i> Hapus`;

  deleteButton.addEventListener("click", () => {
    destroyBook(book.id);
  });

  const bookItem = document.createElement("article");
  bookItem.classList.add("book_item");

  if (book.isCompleted) {
    title.style.textDecoration = "line-through";
    const unreadButton = document.createElement("button");
    unreadButton.classList.add("btn_success");
    unreadButton.innerHTML = `<i class="fa-solid fa-rotate-left"></i> Unread`;

    unreadButton.addEventListener("click", () => {
      toggleBook(book.id);
    });

    divButton.append(unreadButton);
  } else {
    const readButton = document.createElement("button");
    readButton.classList.add("btn_success");
    readButton.innerHTML = `<i class="fa-solid fa-circle-check"></i> Read`;

    readButton.addEventListener("click", () => {
      toggleBook(book.id);
    });

    divButton.append(readButton);
  }

  divButton.append(editButton, deleteButton);
  bookItem.append(title, author, year, divButton);

  return bookItem;
};

function saveData() {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
  }
}

const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Coba lagi browsernya tidak mendukung local storage:)");
    return false;
  }
  return true;
};

const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENTS));
};