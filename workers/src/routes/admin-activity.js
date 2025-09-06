// Admin activity logging routes

export async function handleAdminActivity(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  
  try {
    if (method === 'GET') {
      // GET /api/admin-activity - List admin activities
      return await getAdminActivity(request, env);
    } else if (method === 'POST') {
      // POST /api/admin-activity - Log admin activity
      return await logAdminActivity(request, env);
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Admin activity route error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getAdminActivity(request, env) {
  const url = new URL(request.url);
  const id_admin = url.searchParams.get('id_admin');
  const action = url.searchParams.get('action');
  const date_debut = url.searchParams.get('date_debut');
  const date_fin = url.searchParams.get('date_fin');
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 10;
  const offset = (page - 1) * limit;

  let query = `
    SELECT 
      aa.id_activity,
      aa.id_admin,
      aa.action,
      aa.description,
      aa.ip_address,
      aa.user_agent,
      aa.created_at,
      a.username
    FROM admin_activity aa
    LEFT JOIN administrators a ON aa.id_admin = a.id_admin
    WHERE 1=1
  `;
  let countQuery = 'SELECT COUNT(*) as total FROM admin_activity WHERE 1=1';
  let params = [];
  let countParams = [];

  if (id_admin) {
    query += ' AND aa.id_admin = ?';
    countQuery += ' AND id_admin = ?';
    params.push(parseInt(id_admin));
    countParams.push(parseInt(id_admin));
  }

  if (action) {
    query += ' AND aa.action LIKE ?';
    countQuery += ' AND action LIKE ?';
    const actionPattern = `%${action}%`;
    params.push(actionPattern);
    countParams.push(actionPattern);
  }

  if (date_debut) {
    query += ' AND aa.created_at >= ?';
    countQuery += ' AND created_at >= ?';
    params.push(date_debut);
    countParams.push(date_debut);
  }

  if (date_fin) {
    query += ' AND aa.created_at <= ?';
    countQuery += ' AND created_at <= ?';
    params.push(date_fin);
    countParams.push(date_fin);
  }

  query += ' ORDER BY aa.created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const [activities, countResult] = await Promise.all([
      env.DB.prepare(query).bind(...params).all(),
      env.DB.prepare(countQuery).bind(...countParams).first()
    ]);

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    return new Response(JSON.stringify({
      success: true,
      data: {
        items: activities.results || [],
        total,
        page,
        limit,
        totalPages
      }
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Database error: ' + error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function logAdminActivity(request, env) {
  try {
    const data = await request.json();
    const { id_admin, action, description, ip_address, user_agent } = data;

    // Validate required fields
    if (!id_admin || !action) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Admin ID and action are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await env.DB.prepare(`
      INSERT INTO admin_activity (id_admin, action, description, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(id_admin, action, description || '', ip_address || '', user_agent || '').run();

    if (!result.success) {
      throw new Error('Failed to log admin activity');
    }

    // Get the created activity
    const newActivity = await env.DB.prepare(`
      SELECT 
        aa.id_activity,
        aa.id_admin,
        aa.action,
        aa.description,
        aa.ip_address,
        aa.user_agent,
        aa.created_at,
        a.username
      FROM admin_activity aa
      LEFT JOIN administrators a ON aa.id_admin = a.id_admin
      WHERE aa.id_activity = ?
    `).bind(result.meta.last_row_id).first();

    return new Response(JSON.stringify({
      success: true,
      data: newActivity,
      message: 'Admin activity logged successfully'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Log admin activity error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to log admin activity'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
