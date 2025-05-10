import { config } from 'dotenv';
import express from 'express';
import sqlite3 from 'sqlite3';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

// Để sử dụng __dirname trong ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tạo thư mục để lưu ảnh
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn 2MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|svg/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images (jpeg, jpg, png, svg) are allowed'));
    }
  },
});

config(); // Tải biến môi trường từ .env

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Kết nối đến cơ sở dữ liệu
const db = new sqlite3.Database(process.env.DB_PATH || 'database.db', (err) => {
  if (err) console.error('Error connecting to database:', err.message);
  else console.log('Connected to SQLite database');
});

// Tạo các bảng
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS Users (
      user_id VARCHAR(36) NOT NULL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      reputation_score INT NOT NULL DEFAULT 100,
      violation_count INT NOT NULL DEFAULT 0,
      wallet_balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
      rating DECIMAL(3, 2) NOT NULL DEFAULT 0.00,
      status TEXT NOT NULL DEFAULT 'Active',
      avatar VARCHAR(255) NULL,
      created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Roles (
      role_id INTEGER PRIMARY KEY AUTOINCREMENT,
      role_name VARCHAR(50) NOT NULL UNIQUE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS User_Role (
      user_id VARCHAR(36) NOT NULL,
      role_id INT NOT NULL,
      assigned_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES Users(user_id),
      FOREIGN KEY (role_id) REFERENCES Roles(role_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Categories (
      category_id VARCHAR(36) NOT NULL PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT NULL,
      created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
    )
  `);

  db.run(`
  CREATE TABLE IF NOT EXISTS Items (
    item_id VARCHAR(36) NOT NULL PRIMARY KEY,
    item_name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(255) NULL,
    owner_id VARCHAR(36) NULL,
    category_id VARCHAR(36) NULL,
    created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    type TEXT CHECK(type IN ('Liquidation', 'Exchange', 'Donation')),
    FOREIGN KEY (owner_id) REFERENCES Users(user_id),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
  )
`);

  // Tạo bảng Sell_Exchange_Posts
 db.run(`
  CREATE TABLE IF NOT EXISTS Sell_Exchange_Posts (
    post_id VARCHAR(36) NOT NULL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NULL,
    seller_id VARCHAR(36) NOT NULL,
    category_id VARCHAR(36) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    product_type VARCHAR(100) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    type TEXT NOT NULL CHECK(type IN ('Liquidation', 'Exchange', 'Donation')),
    image TEXT NULL,
    exchange_preferences TEXT NULL,
    item_id VARCHAR(36) NULL,
    created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    FOREIGN KEY (seller_id) REFERENCES Users(user_id),
    FOREIGN KEY (item_id) REFERENCES Items(item_id),
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
  )
`);

  // Thêm cột image nếu chưa tồn tại
  db.run(`
    ALTER TABLE Sell_Exchange_Posts ADD COLUMN image TEXT DEFAULT NULL;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding image column to Sell_Exchange_Posts:', err.message);
    } else {
      console.log('Ensured image column exists in Sell_Exchange_Posts');
    }
  });

  // Thêm cột exchange_preferences nếu chưa tồn tại
  db.run(`
    ALTER TABLE Sell_Exchange_Posts ADD COLUMN exchange_preferences TEXT DEFAULT NULL;
  `, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error('Error adding exchange_preferences column to Sell_Exchange_Posts:', err.message);
    } else {
      console.log('Ensured exchange_preferences column exists in Sell_Exchange_Posts');
    }
  });

  // Tạo bảng Activities
db.run(`
  CREATE TABLE IF NOT EXISTS Activities (
    activity_id VARCHAR(36) NOT NULL PRIMARY KEY,
    organizer_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    goal_amount DECIMAL(10, 2) NOT NULL,
    amount_raised DECIMAL(10, 2) NOT NULL DEFAULT 0,
    image VARCHAR(255) NULL,
    activity_type TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    location TEXT NOT NULL,
    created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    FOREIGN KEY (organizer_id) REFERENCES Users(user_id)
  )
`);

// Thêm cột location nếu chưa tồn tại
db.run(`
  ALTER TABLE Activities ADD COLUMN location TEXT DEFAULT NULL;
`, (err) => {
  if (err && !err.message.includes('duplicate column name')) {
    console.error('Error adding location column to Activities:', err.message);
  } else {
    console.log('Ensured location column exists in Activities');
  }
});

  db.run(`
    CREATE TABLE IF NOT EXISTS Activity_Item (
      activity_id VARCHAR(36) NOT NULL,
      item_id VARCHAR(36) NOT NULL,
      quantity INT DEFAULT 1,
      PRIMARY KEY (activity_id, item_id),
      FOREIGN KEY (activity_id) REFERENCES Activities(activity_id),
      FOREIGN KEY (item_id) REFERENCES Items(item_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Transactions (
      transaction_id VARCHAR(36) NOT NULL PRIMARY KEY,
      user_id VARCHAR(36) NULL,
      post_id VARCHAR(36) NULL,
      activity_id VARCHAR(36) NULL,
      item_id VARCHAR(36) NULL,
      type TEXT NOT NULL,
      status VARCHAR(50) NULL,
      created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      completed_at TEXT NULL,
      FOREIGN KEY (user_id) REFERENCES Users(user_id),
      FOREIGN KEY (post_id) REFERENCES Sell_Exchange_Posts(post_id),
      FOREIGN KEY (activity_id) REFERENCES Activities(activity_id),
      FOREIGN KEY (item_id) REFERENCES Items(item_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Reviews (
      review_id VARCHAR(36) NOT NULL PRIMARY KEY,
      transaction_id VARCHAR(36) NOT NULL,
      reviewer_id VARCHAR(36) NOT NULL,
      reviewee_id VARCHAR(36) NOT NULL,
      rating INT NOT NULL,
      comment TEXT NULL,
      created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id),
      FOREIGN KEY (reviewer_id) REFERENCES Users(user_id),
      FOREIGN KEY (reviewee_id) REFERENCES Users(user_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Violations (
      violation_id VARCHAR(36) NOT NULL PRIMARY KEY,
      reporter_id VARCHAR(36) NOT NULL,
      reported_id VARCHAR(36) NOT NULL,
      post_id VARCHAR(36) NULL,
      reason TEXT NOT NULL,
      admin_notes TEXT NULL,
      created_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      resolved_at TEXT NULL,
      FOREIGN KEY (reporter_id) REFERENCES Users(user_id),
      FOREIGN KEY (reported_id) REFERENCES Users(user_id),
      FOREIGN KEY (post_id) REFERENCES Sell_Exchange_Posts(post_id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS Warehouse_items (
      warehouse_item_id VARCHAR(36) NOT NULL PRIMARY KEY,
      post_id VARCHAR(36) NULL,
      transaction_id VARCHAR(36) NULL,
      quantity INT NOT NULL DEFAULT 1,
      condition TEXT NULL,
      status TEXT NULL DEFAULT 'Stored',
      stored_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      updated_at TEXT DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
      FOREIGN KEY (post_id) REFERENCES Sell_Exchange_Posts(post_id),
      FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id)
    )
  `);
});

// API cho Users
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM Users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/users', (req, res) => {
  const { user_id, name, email, password_hash, reputation_score, violation_count, wallet_balance, rating, status, avatar } = req.body;
  db.run(
    `INSERT INTO Users (user_id, name, email, password_hash, reputation_score, violation_count, wallet_balance, rating, status, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, name, email, password_hash, reputation_score || 100, violation_count || 0, wallet_balance || 0.00, rating || 0.00, status || 'Active', avatar],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'User added successfully' });
    }
  );
});

// API cho Roles
app.get('/api/roles', (req, res) => {
  db.all('SELECT * FROM Roles', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/roles', (req, res) => {
  const { role_name } = req.body;
  db.run(
    `INSERT INTO Roles (role_name) VALUES (?)`,
    [role_name],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Role added successfully' });
    }
  );
});

// API cho Categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT * FROM Categories', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/categories', (req, res) => {
  const { category_id, name, description } = req.body;
  db.run(
    `INSERT INTO Categories (category_id, name, description) VALUES (?, ?, ?)`,
    [category_id, name, description],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Category added successfully' });
    }
  );
});

// API cho Items
// API để lấy danh sách các mục từ bảng Items
app.get('/api/items', (req, res) => {
  const { category, type, search } = req.query;

  let query = 'SELECT * FROM Items';
  const params = [];

  const conditions = [];
  if (category) {
    conditions.push('category_id = ?');
    params.push(category);
  }
  if (type) {
    conditions.push('type = ?');
    params.push(type);
  }
  if (search) {
    conditions.push('item_name LIKE ? OR description LIKE ?');
    params.push(`%${search}%`, `%${search}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error fetching items:', err.message);
      return res.status(500).json({ error: 'Failed to fetch items', details: err.message });
    }

    if (!rows || rows.length === 0) {
      console.log('No items found in Items table');
      return res.json([]);
    }

    const formattedItems = rows.map((item) => ({
      post_id: item.item_id || 'NO-ID',
      title: item.item_name || 'Untitled',
      description: item.description || 'No description',
      image: item.image_url || null,
      category: item.category_id || 'Unknown',
      type: item.type || 'Unknown',
      owner_id: item.owner_id || 'Unknown',
      created_at: item.created_at || new Date().toISOString(),
      seller_id: 'Unknown',
      price: 0,
      product_type: 'Unknown',
      status: 'Approved',
    }));

    res.json(formattedItems);
  });
});

// Giữ nguyên endpoint POST nếu cần
app.post('/api/items', (req, res) => {
  const { item_id, item_name, description, image_url, owner_id, category_id } = req.body;
  db.run(
    `INSERT INTO Items (item_id, item_name, description, image_url, owner_id, category_id) VALUES (?, ?, ?, ?, ?, ?)`,
    [item_id, item_name, description, image_url, owner_id, category_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Item added successfully' });
    }
  );
});

// API cho Sell_Exchange_Posts (CRUD)
app.get('/api/posts', (req, res) => {
  db.all('SELECT * FROM Sell_Exchange_Posts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.get('/api/posts/:post_id', (req, res) => {
  const { post_id } = req.params;
  db.get('SELECT * FROM Sell_Exchange_Posts WHERE post_id = ?', [post_id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Post not found' });
    res.json(row);
  });
});

app.post('/api/posts', upload.array('images', 5), (req, res) => {
  let { post_id, seller_id, item_id, title, description, price, type, product_type, category_id, exchange_preferences } = req.body;

  // Tạo giá trị mặc định nếu thiếu
  post_id = post_id || randomUUID();
  seller_id = seller_id || 'default-seller-id';
  item_id = item_id || randomUUID();
  title = title || 'Untitled Post';
  description = description || 'No description provided';
  type = type || 'Liquidation';
  category_id = category_id || 'default-category-id';
  price = parseFloat(price) || 0;
  product_type = product_type || (type === 'Donation' ? 'Donation' : 'General');
  exchange_preferences = exchange_preferences || null;

  // Ánh xạ giá trị type từ frontend sang giá trị hợp lệ trong database
  const typeMapping = {
    'sell': 'Liquidation',
    'exchange': 'Exchange',
    'donation': 'Donation'
  };
  type = typeMapping[type.toLowerCase()] || type;

  // Kiểm tra các trường bắt buộc tối thiểu
  if (!title || !description || !type || !category_id) {
    return res.status(400).json({ 
      error: 'Missing required fields', 
      details: { title: !!title, description: !!description, type: !!type, category_id: !!category_id }
    });
  }

  // Xử lý hình ảnh (dùng image_url)
  const image_url = req.files && req.files.length > 0 ? req.files.map(file => `/uploads/${file.filename}`).join(',') : null;

  // Bắt đầu giao dịch
  db.serialize(() => {
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        console.error('Error beginning transaction:', err.message);
        return res.status(500).json({ error: 'Failed to begin transaction', details: err.message });
      }

      db.run(
        `INSERT INTO Sell_Exchange_Posts (post_id, title, description, image_url, seller_id, category_id, price, product_type, status, type, item_id, exchange_preferences, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [post_id, title, description, image_url, seller_id, category_id, price, product_type, 'Pending', type, item_id, exchange_preferences, new Date().toISOString()],
        (err) => {
          if (err) {
            console.error('Error inserting into Sell_Exchange_Posts:', err.message);
            db.run('ROLLBACK', () => {
              res.status(500).json({ error: 'Failed to create post', details: err.message });
            });
            return;
          }

          db.run('COMMIT', (err) => {
            if (err) {
              console.error('Error committing transaction:', err.message);
              return res.status(500).json({ error: 'Failed to commit transaction', details: err.message });
            }
            res.status(201).json({ message: 'Post created successfully', post_id });
          });
        }
      );
    });
  });
});

app.put('/api/posts/:post_id', (req, res) => {
  const { post_id } = req.params;
  const { title, description, price, type, product_type, category_id, status, exchange_preferences, image } = req.body;

  if (!title || !description || !price || !type || !product_type || !category_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  db.run(
    `UPDATE Sell_Exchange_Posts SET title = ?, description = ?, price = ?, type = ?, product_type = ?, category_id = ?, status = ?, image = ?, exchange_preferences = ?, updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE post_id = ?`,
    [title, description, price, type, product_type, category_id, status || 'Pending', image || null, exchange_preferences || null, post_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT changes() AS affectedRows', (err, row) => {
        if (row.affectedRows === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ message: 'Post updated successfully' });
      });
    }
  );
});

app.delete('/api/posts/:post_id', (req, res) => {
  const { post_id } = req.params;
  db.run('DELETE FROM Sell_Exchange_Posts WHERE post_id = ?', [post_id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    db.get('SELECT changes() AS affectedRows', (err, row) => {
      if (row.affectedRows === 0) return res.status(404).json({ error: 'Post not found' });
      res.json({ message: 'Post deleted successfully' });
    });
  });
});

// API cho admin
app.get('/api/admin/items', async (req, res) => {
  try {
    // Lấy dữ liệu từ Sell_Exchange_Posts
    db.all('SELECT * FROM Sell_Exchange_Posts WHERE status = ?', ['Pending'], async (err, items) => {
      if (err) {
        console.error('Error executing query:', err);
        return res.status(500).json({ error: 'Failed to fetch items', details: err.message });
      }

      console.log('Raw items from database:', items);

      if (!items || items.length === 0) {
        console.log('No pending items found in Sell_Exchange_Posts');
        return res.json([]);
      }

      // Hàm lấy tên seller từ Users
      const getSellerName = (seller_id) => {
        return new Promise((resolve) => {
          db.get('SELECT name FROM Users WHERE user_id = ?', [seller_id], (err, user) => {
            if (err) {
              console.error('Error fetching seller:', err);
              resolve('Unknown Seller');
            } else {
              resolve(user?.name || 'Unknown Seller');
            }
          });
        });
      };

      // Format items
      const formattedItems = [];
      for (const item of items) {
        if (!item) {
          console.warn('Found null item in result set, skipping...');
          continue;
        }

        const seller = await getSellerName(item.seller_id);
        formattedItems.push({
          id: item.post_id || 'NO-ID',
          post_id: item.post_id || 'NO-ID',
          title: item.title || 'Untitled',
          description: item.description || '',
          price: item.price || 0,
          image: item.image || '',
          category: item.category_id || 'Unknown',
          type: item.type || 'Unknown',
          product_type: item.product_type || 'General',
          seller: seller,
          seller_id: item.seller_id || 'NO-SELLER',
          status: item.status || 'Pending',
          dateSubmitted: item.created_at || new Date().toISOString(),
        });
      }

      res.json(formattedItems);
    });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items', details: error.message });
  }
});

app.post('/api/admin/approve/:post_id', async (req, res) => {
  const { post_id } = req.params;
  const { item_id, item_name, description, image_url, category_id, create_at } = req.body;

  try {
    // Lấy bản ghi từ Sell_Exchange_Posts
    const item = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM Sell_Exchange_Posts WHERE post_id = ? AND status = ?', [post_id, 'Pending'], (err, row) => {
        if (err) reject(err);
        resolve(row);
      });
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found or already processed' });
    }

    // Thêm vào bảng Items
    await new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO Items (item_id, item_name, description, image_url, owner_id, category_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          item_id || post_id,
          item_name || item.title,
          description || item.description,
          image_url || item.image,
          item.seller_id, // owner_id là seller_id từ Sell_Exchange_Posts
          category_id || item.category_id,
          create_at || item.created_at || new Date().toISOString()
        ],
        (err) => {
          if (err) {
            console.error('Error inserting into Items:', err.message);
            reject(err);
          } else {
            console.log(`Inserted item ${item_id || post_id} into Items table`);
            resolve();
          }
        }
      );
    });

    // Xóa khỏi Sell_Exchange_Posts
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM Sell_Exchange_Posts WHERE post_id = ?', [post_id], (err) => {
        if (err) {
          console.error('Error deleting from Sell_Exchange_Posts:', err.message);
          reject(err);
        } else {
          console.log(`Deleted post ${post_id} from Sell_Exchange_Posts`);
          resolve();
        }
      });
    });

    res.json({ message: 'Item approved and moved to Items table' });
  } catch (error) {
    console.error('Error approving item:', error);
    res.status(500).json({ error: 'Failed to approve item', details: error.message });
  }
});
// API để lấy danh sách hoạt động cho admin (tương tự /api/admin/items)
app.get('/api/admin/activities', async (req, res) => {
  try {
    // Lấy tất cả hoạt động từ bảng Activities
    const rows = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM Activities', [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    if (!rows || rows.length === 0) {
      console.log('No activities found in Activities table');
      return res.json([]);
    }

    // Format dữ liệu, xử lý organizer bất đồng bộ
    const formattedActivities = await Promise.all(
      rows.map(async (activity) => {
        // Lấy thông tin organizer từ bảng Users
        const organizer = activity.organizer_id
          ? await new Promise((resolve, reject) => {
              db.get('SELECT name FROM Users WHERE user_id = ?', [activity.organizer_id], (err, user) => {
                if (err) reject(err);
                resolve(user ? user.name : 'Unknown Organizer');
              });
            })
          : 'Unknown Organizer';

        return {
          id: activity.activity_id || 'NO-ID',
          name: activity.title || 'Untitled',
          type: activity.activity_type || 'Unknown',
          organizer: organizer,
          dateStart: activity.start_date || new Date().toISOString(),
          dateEnd: activity.end_date || new Date().toISOString(),
          status: activity.status || 'Pending',
          totalRaised: activity.amount_raised || 0,
          participants: 0, // Có thể cần bảng riêng để theo dõi participants
          target: activity.goal_amount || null,
          description: activity.description || 'No description provided',
        };
      })
    );

    res.json(formattedActivities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Failed to fetch activities', details: error.message });
  }
});
app.post('/api/admin/approve-post/:id', (req, res) => {
  const postId = req.params.id;
  const { item_id, item_name, description, image_url, category_id, create_at } = req.body;

  console.log('Payload from frontend:', { item_id, item_name, description, image_url, category_id, create_at });

  db.get('SELECT * FROM Sell_Exchange_Posts WHERE post_id = ?', [postId], (err, post) => {
    if (err || !post) {
      return res.status(500).json({ error: 'Failed to find post' });
    }

    console.log('Data from Sell_Exchange_Posts:', {
      post_id: post.post_id,
      image_url: post.image_url,
      type: post.type,
      image: post.image
    });

    // Ưu tiên image_url từ Sell_Exchange_Posts, bỏ qua nếu là chuỗi rỗng, sau đó lấy từ req.body nếu có
    const imageUrlToInsert = (post.image_url && post.image_url !== '') 
      ? post.image_url 
      : (post.image && post.image !== '' ? post.image.split(',')[0] : (image_url && image_url !== '' ? image_url : null));

    // Ưu tiên type từ Sell_Exchange_Posts, mặc định là 'Liquidation' nếu không có
    const typeToInsert = (post.type && post.type !== '') ? post.type : 'Liquidation';

    db.run(
      `INSERT INTO Items (item_id, item_name, description, image_url, owner_id, category_id, created_at, type) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        post.post_id,
        item_name || post.title,
        description || post.description,
        imageUrlToInsert,
        post.seller_id,
        category_id || post.category_id,
        create_at || post.created_at || new Date().toISOString(),
        typeToInsert,
      ],
      (err) => {
        if (err) {
          console.error('Error inserting into Items:', err.message);
          return res.status(500).json({ error: 'Failed to approve post', details: err.message });
        }

        console.log('Inserted into Items:', {
          item_id: post.post_id,
          image_url: imageUrlToInsert,
          type: typeToInsert
        });

        db.run(
          `UPDATE Sell_Exchange_Posts SET status = 'Approved' WHERE post_id = ?`,
          [postId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to update post status' });
            }
            res.json({ message: 'Post approved and moved to Items' });
          }
        );
      }
    );
  });
});
app.post('/api/warehouse-items', (req, res) => {
  const { warehouse_item_id, post_id, transaction_id, quantity, condition, status, stored_at, updated_at } = req.body;

  db.run(
    `INSERT INTO Warehouse_items (warehouse_item_id, post_id, transaction_id, quantity, condition, status, stored_at, updated_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      warehouse_item_id || crypto.randomUUID(),
      post_id || null,
      transaction_id || crypto.randomUUID(),
      quantity || 0,
      condition || 'Unknown',
      status || 'Pending',
      stored_at || new Date().toISOString(),
      updated_at || new Date().toISOString(),
    ],
    (err) => {
      if (err) {
        console.error('Error inserting into Warehouse_items:', err.message);
        return res.status(500).json({ error: 'Failed to create warehouse item', details: err.message });
      }
      res.status(201).json({ message: 'Warehouse item created successfully', warehouse_item_id });
    }
  );
});

// Đảm bảo bảng Warehouse_items được tạo (nếu chưa có)
db.run(`
  CREATE TABLE IF NOT EXISTS Warehouse_items (
    warehouse_item_id VARCHAR(36) NOT NULL PRIMARY KEY,
    post_id VARCHAR(36) NULL,
    transaction_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    condition TEXT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    stored_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%d %H:%M:%S', 'now'))
  )
`);
// API để approve hoạt động (tương tự /api/admin/approve/:post_id)
app.post('/api/admin/approve-activity/:activity_id', (req, res) => {
  const { activity_id } = req.params;

  db.run(
    `UPDATE Activities SET status = 'active', updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE activity_id = ?`,
    [activity_id],
    (err) => {
      if (err) {
        console.error('Error approving activity:', err.message);
        return res.status(500).json({ error: 'Failed to approve activity', details: err.message });
      }
      db.get('SELECT changes() AS affectedRows', (err, row) => {
        if (row.affectedRows === 0) return res.status(404).json({ error: 'Activity not found' });
        res.json({ message: 'Activity approved successfully' });
      });
    }
  );
});

// API để reject hoạt động
app.post('/api/admin/reject-activity/:activity_id', (req, res) => {
  const { activity_id } = req.params;

  db.run(
    `UPDATE Activities SET status = 'rejected', updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE activity_id = ?`,
    [activity_id],
    (err) => {
      if (err) {
        console.error('Error rejecting activity:', err.message);
        return res.status(500).json({ error: 'Failed to reject activity', details: err.message });
      }
      db.get('SELECT changes() AS affectedRows', (err, row) => {
        if (row.affectedRows === 0) return res.status(404).json({ error: 'Activity not found' });
      });
      res.json({ message: 'Activity rejected successfully' });
    }
  );
});

app.delete('/api/admin/reject/:post_id', (req, res) => {
  const { post_id } = req.params;
  db.get('SELECT * FROM Sell_Exchange_Posts WHERE post_id = ? AND status = ?', [post_id, 'Pending'], (err, item) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!item) return res.status(404).json({ error: 'Item not found or already processed' });

    db.run('DELETE FROM Sell_Exchange_Posts WHERE post_id = ?', [post_id], (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Item rejected and removed' });
    });
  });
});

app.put('/api/posts/approve/:post_id', (req, res) => {
  const { post_id } = req.params;
  db.run(
    `UPDATE Sell_Exchange_Posts SET status = 'Approved', updated_at = strftime('%Y-%m-%d %H:%M:%S', 'now') WHERE post_id = ?`,
    [post_id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      db.get('SELECT changes() AS affectedRows', (err, row) => {
        if (row.affectedRows === 0) return res.status(404).json({ error: 'Post not found' });
        res.json({ message: 'Post approved successfully' });
      });
    }
  );
});

// API cho Transactions
app.get('/api/transactions', (req, res) => {
  db.all('SELECT * FROM Transactions', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/transactions', (req, res) => {
  const { transaction_id, user_id, post_id, activity_id, item_id, type, status } = req.body;
  db.run(
    `INSERT INTO Transactions (transaction_id, user_id, post_id, activity_id, item_id, type, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [transaction_id, user_id, post_id, activity_id, item_id, type, status],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Transaction processed' });
    }
  );
});

// API cho Warehouse_items
app.get('/api/warehouse-items', (req, res) => {
  db.all('SELECT * FROM Warehouse_items', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/warehouse-items', (req, res) => {
  const { warehouse_item_id, post_id, transaction_id, quantity, condition, status } = req.body;
  db.run(
    `INSERT INTO Warehouse_items (warehouse_item_id, post_id, transaction_id, quantity, condition, status) VALUES (?, ?, ?, ?, ?, ?)`,
    [warehouse_item_id, post_id, transaction_id, quantity || 1, condition, status || 'Stored'],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Warehouse item added successfully' });
    }
  );
});

// API cho Violations
app.get('/api/violations', (req, res) => {
  db.all('SELECT * FROM Violations', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/violations', (req, res) => {
  const { violation_id, reporter_id, reported_id, post_id, reason, admin_notes } = req.body;
  db.run(
    `INSERT INTO Violations (violation_id, reporter_id, reported_id, post_id, reason, admin_notes) VALUES (?, ?, ?, ?, ?, ?)`,
    [violation_id, reporter_id, reported_id, post_id, reason, admin_notes],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Violation reported successfully' });
    }
  );
});

// API cho Reviews
app.get('/api/reviews', (req, res) => {
  db.all('SELECT * FROM Reviews', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/reviews', (req, res) => {
  const { review_id, transaction_id, reviewer_id, reviewee_id, rating, comment } = req.body;
  db.run(
    `INSERT INTO Reviews (review_id, transaction_id, reviewer_id, reviewee_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)`,
    [review_id, transaction_id, reviewer_id, reviewee_id, rating, comment],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ message: 'Review added successfully' });
    }
  );
});

// API cho Activities
app.get('/api/activities', (req, res) => {
  db.all('SELECT * FROM Activities', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/api/activities', upload.single('image'), (req, res) => {
  const { activity_id, organizer_id, title, description, goal_amount, amount_raised, activity_type, start_date, end_date, location } = req.body;

  // Log dữ liệu nhận được để debug
  console.log('Received data for /api/activities:', {
    activity_id,
    organizer_id,
    title,
    description,
    goal_amount,
    amount_raised,
    activity_type,
    start_date,
    end_date,
    location,
    image: req.file ? req.file.filename : null,
  });

  // Kiểm tra các trường bắt buộc
  if (!title || !activity_type || !start_date || !end_date || !location) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: {
        title: !!title,
        activity_type: !!activity_type,
        start_date: !!start_date,
        end_date: !!end_date,
        location: !!location,
      },
    });
  }

  const image = req.file ? `/uploads/${req.file.filename}` : null;

  db.run(
    `INSERT INTO Activities (activity_id, organizer_id, title, description, goal_amount, amount_raised, image, activity_type, start_date, end_date, location, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      activity_id || randomUUID(),
      organizer_id || 'user1',
      title,
      description || '',
      parseFloat(goal_amount) || 0,
      parseFloat(amount_raised) || 0,
      image,
      activity_type,
      start_date,
      end_date,
      location || 'Unknown Location', // Đảm bảo location không NULL
      new Date().toISOString(),
    ],
    (err) => {
      if (err) {
        console.error('Error inserting into Activities:', err.message);
        return res.status(500).json({ error: 'Failed to create activity', details: err.message });
      }
      res.status(201).json({ message: 'Activity created successfully', activity_id: activity_id || randomUUID() });
    }
  );
});

// API cho Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get(
    'SELECT * FROM Users WHERE email = ? AND password_hash = ?',
    [email, password],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });
      res.status(200).json({
        message: 'Login successful',
        user: {
          user_id: user.user_id,
          email: user.email,
          role: user.role || 'user',
        },
      });
    }
  );
});

// Phục vụ file tĩnh (ảnh upload)
app.use('/uploads', express.static(uploadDir));

// Chạy server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});