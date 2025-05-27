// src/components/CommentItem.jsx
export default function CommentItem({ comment, onReply, onEdit, onDelete }) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  return (
    <div style={{ marginLeft: comment.level * 16 }}>
      <Card className="comment-card mb-2">
        <Card.Body>
          <Card.Subtitle>@{comment.username}</Card.Subtitle>
          <Card.Text>{comment.content}</Card.Text>
          <small>{new Date(comment.created_at).toLocaleString()}</small>
          <div className="mt-1">
            <Button size="sm" onClick={()=>setShowReplyForm(!showReplyForm)}>Reply</Button>
            {/* + Edit/Delete */}
          </div>
          {showReplyForm && (
            <ReplyForm onSubmit={replyContent=>onReply(comment.id, replyContent)} />
          )}
        </Card.Body>
      </Card>
      {comment.replies.map(r=>(
        <CommentItem 
          key={r.id} 
          comment={{...r, level:(comment.level||0)+1}} 
          onReply={onReply} 
          onEdit={onEdit} 
          onDelete={onDelete} 
        />
      ))}
    </div>
  );
}
