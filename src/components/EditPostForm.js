import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';

export default function EditPostForm({ post, onSave }) {
  const [content, setContent] = useState(post.content);
  return (
    <Form onSubmit={e=>{ e.preventDefault(); onSave(content); }}>
      <Form.Group>
        <Form.Control 
          as="textarea" rows={3} 
          value={content} 
          onChange={e=>setContent(e.target.value)} 
        />
      </Form.Group>
      <Button type="submit" className="mt-2">Simpan</Button>
    </Form>
  );
}
