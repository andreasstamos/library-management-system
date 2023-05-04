import React, { useState } from 'react'
import axios from 'axios'
import PaginationControlled from '../Components/PaginationControlled';
import BookCard from '../Components/BookCard';
import './Books.css'
import SearchBar from '../Components/SearchBar';


function Books() {

    const [books, setBooks] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

  return (
    <div className='books-page-container'>
        <h1 className='page-container-title title-with-hr'>Books</h1>
        <div className='page-filters'>
            <PaginationControlled totalPages={10} page={page} setPage={setPage} />
            <SearchBar />
        </div>
        <div className='books-container'>

           { [1,1,1,1,1,1,1,1,1,1,1,1].map((item, index) => { 
            return index % 2 === 0 ?  <BookCard 
            imageURI={"https://upload.wikimedia.org/wikipedia/commons/thumb/b/b0/12_Rules_for_Life_Front_Cover_%282018_first_edition%29.jpg/640px-12_Rules_for_Life_Front_Cover_%282018_first_edition%29.jpg"}
            title={"12 Rules for Life"}
            summary={`"12 Rules for Life" is a bestselling self-help book by Canadian psychologist Jordan Peterson. It provides practical advice on how to live a meaningful and successful life, drawing on philosophy, mythology, and psychology. Some of the key ideas in the book include taking responsibility for one's own life, setting goals and pursuing them, and cultivating meaningful relationships. The book has been praised for its insights and criticized for its controversial views on gender and politics.`}
            isbn={9780142437230} />
            : <BookCard 
            imageURI={"https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Beyond_Order_12_More_Rules_For_Life_1st_Edition_Cover_Canadian.jpg/440px-Beyond_Order_12_More_Rules_For_Life_1st_Edition_Cover_Canadian.jpg"}
            title={"Beyond Order"}
            summary={`"12 Rules for Life" is a bestselling self-help book by Canadian psychologist Jordan Peterson. It provides practical advice on how to live a meaningful and successful life, drawing on philosophy, mythology, and psychology. Some of the key ideas in the book include taking responsibility for one's own life, setting goals and pursuing them, and cultivating meaningful relationships. The book has been praised for its insights and criticized for its controversial views on gender and politics.`}
            isbn={9780142437230}
            />
           })}


        </div>
    </div>
  )
}

export default Books