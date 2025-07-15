// This function is deprecated - we now use Supabase directly
exports.handler = async function(event, context) {
  return {
    statusCode: 410,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      error: 'This function is deprecated. We now use Supabase for user management.',
      redirect: '/signup'
    })
  };
}; 