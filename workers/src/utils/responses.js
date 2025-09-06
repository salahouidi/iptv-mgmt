// Response utilities for consistent API responses

export function successResponse(data, message = null, status = 200) {
  const response = {
    success: true,
    data: data
  };
  
  if (message) {
    response.message = message;
  }
  
  return new Response(JSON.stringify(response), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function errorResponse(error, status = 400) {
  return new Response(JSON.stringify({
    success: false,
    error: error
  }), {
    status: status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function paginatedResponse(data, total, page = 1, limit = 50) {
  return successResponse({
    items: data,
    pagination: {
      total: total,
      page: page,
      limit: limit,
      pages: Math.ceil(total / limit)
    }
  });
}

export async function parseRequestBody(request) {
  try {
    const contentType = request.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await request.json();
    }
    return {};
  } catch (error) {
    throw new Error('Invalid JSON in request body');
  }
}
