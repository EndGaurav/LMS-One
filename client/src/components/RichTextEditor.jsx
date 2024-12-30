import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({input, setInput}) => {
    // console.log("Input in text editor component: ", input);
    
    const handleChange = (content) => {
        console.log("content in text editor component: ", content);
        setInput({...input, description: content})
    }
    return (
        <>
            <ReactQuill theme="snow" value={input.description} onChange={handleChange} />
        </>
    )
}

export default RichTextEditor