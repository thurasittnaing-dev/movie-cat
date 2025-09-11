import React, {useEffect} from 'react'

const Search = ({searchTerm,setSearchTerm}) => {

    return (
        <>
            <div className="search">
                <div>
                    <img src="./search.svg" alt="Search Icon" />

                    <input
                        type="search"
                        placeholder="Search through thousands of movies"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                    />
                </div>
            </div>
        </>
    )
}
export default Search
