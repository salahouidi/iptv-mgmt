// Administrator management routes

export async function handleAdministrators(request, env) {
  const url = new URL(request.url);
  const method = request.method;
  const pathSegments = url.pathname.split('/').filter(Boolean);
  
  try {
    if (method === 'GET' && pathSegments.length === 2) {
      // GET /api/administrators - List administrators
      return await getAdministrators(request, env);
    } else if (method === 'GET' && pathSegments.length === 3) {
      // GET /api/administrators/:id - Get administrator by ID
      const id = parseInt(pathSegments[2]);
      return await getAdministratorById(id, env);
    } else if (method === 'POST' && pathSegments.length === 2) {
      // POST /api/administrators - Create administrator
      return await createAdministrator(request, env);
    } else if (method === 'PUT' && pathSegments.length === 3) {
      // PUT /api/administrators/:id - Update administrator
      const id = parseInt(pathSegments[2]);
      return await updateAdministrator(id, request, env);
    } else if (method === 'DELETE' && pathSegments.length === 3) {
      // DELETE /api/administrators/:id - Delete administrator
      const id = parseInt(pathSegments[2]);
      return await deleteAdministrator(id, env);
    } else if (method === 'PUT' && pathSegments[2] === 'credentials') {
      // PUT /api/administrators/credentials - Update credentials
      return await updateCredentials(request, env);
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Route not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  } catch (error) {
    console.error('Administrator route error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function getAdministrators(request, env) {
  const url = new URL(request.url);
  const role = url.searchParams.get('role');
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');
  const page = parseInt(url.searchParams.get('page')) || 1;
  const limit = parseInt(url.searchParams.get('limit')) || 10;
  const offset = (page - 1) * limit;

  let query = `
    SELECT id_admin, username, email, role, status, created_at, updated_at, last_login
    FROM administrators 
    WHERE 1=1
  `;
  let countQuery = 'SELECT COUNT(*) as total FROM administrators WHERE 1=1';
  let params = [];
  let countParams = [];

  if (role) {
    query += ' AND role = ?';
    countQuery += ' AND role = ?';
    params.push(role);
    countParams.push(role);
  }

  if (status) {
    query += ' AND status = ?';
    countQuery += ' AND status = ?';
    params.push(status);
    countParams.push(status);
  }

  if (search) {
    query += ' AND (username LIKE ? OR email LIKE ?)';
    countQuery += ' AND (username LIKE ? OR email LIKE ?)';
    const searchPattern = `%${search}%`;
    params.push(searchPattern, searchPattern);
    countParams.push(searchPattern, searchPattern);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  try {
    const [administrators, countResult] = await Promise.all([
      env.DB.prepare(query).bind(...params).all(),
      env.DB.prepare(countQuery).bind(...countParams).first()
    ]);

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    return new Response(JSON.stringify({
      success: true,
      data: {
        items: administrators.results || [],
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

async function getAdministratorById(id, env) {
  try {
    const administrator = await env.DB.prepare(`
      SELECT id_admin, username, email, role, status, created_at, updated_at, last_login
      FROM administrators 
      WHERE id_admin = ?
    `).bind(id).first();

    if (!administrator) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Administrator not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: administrator
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

async function createAdministrator(request, env) {
  try {
    const data = await request.json();
    const { username, email, password, role = 'Admin', status = 'Actif' } = data;

    // Validate required fields
    if (!username || !email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Username, email, and password are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if username or email already exists
    const existing = await env.DB.prepare(`
      SELECT id_admin FROM administrators 
      WHERE username = ? OR email = ?
    `).bind(username, email).first();

    if (existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Username or email already exists'
      }), {
        status: 409,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash password (in production, use proper password hashing)
    const hashedPassword = password; // TODO: Implement proper password hashing

    const result = await env.DB.prepare(`
      INSERT INTO administrators (username, email, password_hash, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(username, email, hashedPassword, role, status).run();

    if (!result.success) {
      throw new Error('Failed to create administrator');
    }

    // Get the created administrator
    const newAdmin = await env.DB.prepare(`
      SELECT id_admin, username, email, role, status, created_at, updated_at
      FROM administrators 
      WHERE id_admin = ?
    `).bind(result.meta.last_row_id).first();

    return new Response(JSON.stringify({
      success: true,
      data: newAdmin,
      message: 'Administrator created successfully'
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Create administrator error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to create administrator'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function updateAdministrator(id, request, env) {
  try {
    const data = await request.json();
    const { username, email, role, status } = data;

    // Check if administrator exists
    const existing = await env.DB.prepare(`
      SELECT id_admin FROM administrators WHERE id_admin = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Administrator not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (username !== undefined) {
      updates.push('username = ?');
      params.push(username);
    }
    if (email !== undefined) {
      updates.push('email = ?');
      params.push(email);
    }
    if (role !== undefined) {
      updates.push('role = ?');
      params.push(role);
    }
    if (status !== undefined) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No fields to update'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    updates.push('updated_at = datetime(\'now\')');
    params.push(id);

    const result = await env.DB.prepare(`
      UPDATE administrators 
      SET ${updates.join(', ')}
      WHERE id_admin = ?
    `).bind(...params).run();

    if (!result.success) {
      throw new Error('Failed to update administrator');
    }

    // Get the updated administrator
    const updatedAdmin = await env.DB.prepare(`
      SELECT id_admin, username, email, role, status, created_at, updated_at
      FROM administrators 
      WHERE id_admin = ?
    `).bind(id).first();

    return new Response(JSON.stringify({
      success: true,
      data: updatedAdmin,
      message: 'Administrator updated successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update administrator error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to update administrator'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function deleteAdministrator(id, env) {
  try {
    // Check if administrator exists
    const existing = await env.DB.prepare(`
      SELECT id_admin, role FROM administrators WHERE id_admin = ?
    `).bind(id).first();

    if (!existing) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Administrator not found'
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Prevent deletion of Super Admin
    if (existing.role === 'Super Admin') {
      return new Response(JSON.stringify({
        success: false,
        error: 'Cannot delete Super Admin'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await env.DB.prepare(`
      DELETE FROM administrators WHERE id_admin = ?
    `).bind(id).run();

    if (!result.success) {
      throw new Error('Failed to delete administrator');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Administrator deleted successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Delete administrator error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to delete administrator'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

async function updateCredentials(request, env) {
  try {
    const data = await request.json();
    const { username, new_password, confirm_password, current_password } = data;

    // Validate required fields
    if (!username || !new_password || !confirm_password || !current_password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'All fields are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if passwords match
    if (new_password !== confirm_password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'New passwords do not match'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // TODO: Implement proper authentication and password verification
    // For now, we'll just update the credentials

    // Hash new password (in production, use proper password hashing)
    const hashedPassword = new_password; // TODO: Implement proper password hashing

    const result = await env.DB.prepare(`
      UPDATE administrators 
      SET username = ?, password_hash = ?, updated_at = datetime('now')
      WHERE username = ? OR email = ?
    `).bind(username, hashedPassword, username, username).run();

    if (!result.success || result.changes === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Failed to update credentials or user not found'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Credentials updated successfully'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update credentials error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Failed to update credentials'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
