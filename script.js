let actual_cover = ''; // Path to actual cover in dialog "Book's info"
let library = []; // All books in library

// Constructor of class 'Book'
function Book (author, title, pages, already_read, cover) {
   if (!new.target) {
      throw Error ("Objekt 'Book' must be created with 'new' operator");
   }

   this.author = author;
   this.title = title;
   this.pages = pages;
   this.already_read = already_read;
   this.cover = cover;
   this.hash = crypto.randomUUID ();
}

// Funktion to append object of class 'Book' to DOM
Book.prototype.appendToDOM = function () {
   
   // Make text no longer as 20 symbols. Large textes looks ugly in book's cell
   function shrink (str) {
      if (typeof str != 'string' || str.length < 20)
         return str;

      return str.substring (0, 17) + '...';
   };

   // Append to book a new paragraph with a text. Will be used to create 'Author', 'Title'
   // and 'Pages' sections
   function appendTextElem (root, name, value, setTooltyp) {
      // Create a new paragraph
      const elem = document.createElement ('p');
      elem.innerText = name;
      elem.cursor = 'default'; // Default 'I'-cursor looks ugly, switch to arrow

      // Create span to show paragraph's value
      const elem_span = document.createElement ('span');
      elem_span.innerText = shrink (value); // Text to output will be no longer as 20 symbols
      elem_span.style.cursor = 'default';

      // Assing full text as tooltyps to paragraph and value
      if (setTooltyp) {
         elem.setAttribute ('title', value);
         elem_span.setAttribute ('title', value);
      }

      elem.appendChild (elem_span);
      root.appendChild (elem);
   };
 
   const content = document.querySelector ('.content');
   
   // Create a new book's cell
   const book = document.createElement ('div');
   book.classList.add ('book');
   book.addEventListener ('mouseenter', onBookHover);
   book.addEventListener ('mouseleave', onBookLeave);
   book.setAttribute ('data-hash', this.hash);

   // Create image for book's cover
   const cover = document.createElement ('img');
   cover.setAttribute ('width', '140');
   cover.setAttribute ('height', '180');
   cover.setAttribute ('alt', 'cover');
   cover.setAttribute ('src', this.cover);
   book.appendChild (cover);

   appendTextElem (book, 'Author:  ', this.author, true /*setTooltyp*/);
   appendTextElem (book, 'Title:  ', this.title, true /*setTooltyp*/);
   appendTextElem (book, 'Pages:  ', this.pages, false /*No tooltyps for pages*/);

   // Append label 'Already read'
   const read = document.createElement ('p');
   read.innerText = 'Already read:';
   book.appendChild (read);

   // Append toggle for label 'Already read'
   const toggle = document.createElement ('label');
   toggle.classList.add ('toggle');

   const checkbox = document.createElement ('input');
   checkbox.setAttribute ('type', 'checkbox');
   checkbox.setAttribute ('name', 'toggle_read_status');
   if (this.already_read)
      checkbox.checked = true;

   toggle.appendChild (checkbox);

   const slider = document.createElement ('span');
   slider.classList.add ('slider');
   toggle.appendChild (slider);

   book.appendChild (toggle);
   content.appendChild (book);
}

// Process hover on book's cell
function onBookHover (ev) {
   // Create and show button for remove book from library
   const btn = document.createElement ('img');
   btn.classList.add ('btn_delete');
   btn.setAttribute ('alt', 'remove');
   btn.setAttribute ('src', 'img/delete.png');
   btn.setAttribute ('draggable', 'false');
   btn.setAttribute ('data-hash', ev.target.dataset.hash);
   btn.addEventListener ('click', deleteBook);
   
   ev.target.appendChild (btn);
}

// Remove delete button from book, when mouse leaves book's cell
function onBookLeave (ev) {
   ev.target.querySelector ("img:last-child").remove ();
}

// Remove selected book from library
function deleteBook (ev) {
   if (library.length === 0)
      return;

   // Remove book with given hash from DOM
   const books = document.querySelectorAll (`.book[data-hash="${ev.target.dataset.hash}"]`);
   books.forEach (el => el.remove ());

   // Remove book from library
   library = library.filter (item => item.hash != ev.target.dataset.hash);
}

// Append book to DOM and to library
function addBookToLibrary (author, title, pages, already_read, cover) {
   let book = new Book (author, title, pages, already_read, cover);
   library.push (book);
   book.appendToDOM ();
}

// Open dialog to append a new book
function openDialogForNewBook () {
   alreadyRead = false;
   actual_cover = '';
   
   const dialog = document.querySelector ('dialog');
   dialog.showModal ();

   // Move dialog to the button 'New Book'
   const rc_btn = document.querySelector ('.btn_new_book').getBoundingClientRect ();
   const rc_dlg = dialog.getBoundingClientRect ();
   dialog.style.top = (rc_btn.bottom + 10) + 'px';
   dialog.style.left = (rc_btn.right - rc_dlg.width) + 'px';

   // Show frame for preview image of book's cover
   document.querySelector ('.preview_frame').style.border = '1px dotted white';
}

// Click on button 'Confirm' in dialog
function confirmNewBook (e) {
   e.preventDefault ();
   
   // Get value of dialogs element with given ID (for a change implemented as lambda-function)
   let getValue = (id) => {
      const elem = document.querySelector (`#${id}`);
      if (elem.value != '')
         return elem.value.trim ();

      // Required element is not filled. Show it with red color. 
      elem.style.border = '1px solid red';
      elem.style.boxShadow = '1px 1px 4px red, 0 0 1em red, 0 0 0.2em red';
   }

   const author = getValue ('author');
   if (!author)
      return;

   const title = getValue ('title');
   if (!title)
      return;

   const pages = getValue ('pages');
   if (!pages)
      return;

   // Hier we know that all required fields are filled. Append book to library and close dialog. 
   const alreadyRead = document.querySelector ('.read_toggle input').checked;
   addBookToLibrary (author, title, pages, alreadyRead, actual_cover === '' ? 'img/no_cover.png' : actual_cover);

   closeDialog ();
}

// Select cover image fro a new book from file
function selectCover (evt) {
   const [files] = evt.target.files;
   if (files) {
      // Direct acces to filesystem is in JS as a rule vorbidden. We use Web-API funktion to bypass that.
      actual_cover = URL.createObjectURL (files);

      // Show selected image in preview
      const cover = document.querySelector ('.cover_image');
      cover.style.display = 'inline-block';
      cover.setAttribute ('src', actual_cover);

      // Hide preview frame
      document.querySelector ('.preview_frame').style.border = 'none';
   }
}

// Close dialog with in formation about new book
function closeDialog () {
   document.querySelector ('form').reset ();
   document.querySelector ('.cover_image').style.display = 'none';
   document.querySelector ('dialog').close ();
}

// Trigger to call by input something in required fields. Hier will decoration "Required field was not filled" removed,
// which was probably set by click on comfirmation's button with presence of empty required fields  
function inputBookInfo (ev) {
   ev.target.style.border = 'none';
   ev.target.style.boxShadow = 'none';
}

// Funktion to initialize all for using of other functions
function initialize () {
   /*To prevent dragging image from a page*/
   window.ondragstart = () => {return false; };

   // Set callback-functions
   document.querySelector ('.close').addEventListener ('click', closeDialog);
   document.querySelector ('.btn_new_book').addEventListener ('click', openDialogForNewBook);
   document.querySelector ('.confirm').addEventListener ('click', confirmNewBook);
   document.querySelectorAll ('.book_info input')
           .forEach (elem => elem.addEventListener ('input', inputBookInfo));
   document.querySelector ('#file_cover').addEventListener ('change', selectCover)

   // Append some random books to library
   addBookToLibrary ('John Steinbeck', 'Of Mice And Man', 107, true, 'img/book_cover1.png');
   addBookToLibrary ('Hermann Hesse', 'Steppenwolf', 248, true, 'img/book_cover2.png');
   addBookToLibrary ('James Joyce', 'Ulisses', 1034, false, 'img/book_cover3.png');
}

initialize ();