import { useEffect, useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

// Định nghĩa kiểu dữ liệu cho người dùng
interface User {
  user_id: string;
  name: string;
  email: string;
  password_hash: string;
  reputation_score: number;
  violation_count: number;
  wallet_balance: number;
  rating: number;
  status: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState<User>({
    user_id: '',
    name: '',
    email: '',
    password_hash: '',
    reputation_score: 100,
    violation_count: 0,
    wallet_balance: 0.00,
    rating: 4.5,
    status: 'Active',
    avatar: null,
    created_at: '',
    updated_at: '',
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: newUser.user_id,
          name: newUser.name,
          email: newUser.email,
          password_hash: newUser.password_hash,
          reputation_score: newUser.reputation_score,
          violation_count: newUser.violation_count,
          wallet_balance: newUser.wallet_balance,
          rating: newUser.rating,
        }),
      });
      if (!response.ok) throw new Error('Failed to add user');
      const result = await response.json();
      alert(result.message);
      const updatedUsers = await (await fetch('http://localhost:5000/api/users')).json();
      setUsers(updatedUsers);
      setNewUser({
        user_id: '',
        name: '',
        email: '',
        password_hash: '',
        reputation_score: 100,
        violation_count: 0,
        wallet_balance: 0.00,
        rating: 4.5,
        status: 'Active',
        avatar: null,
        created_at: '',
        updated_at: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p>No users found.</p>
          ) : (
            <ul className="space-y-2">
              {users.map((user) => (
                <li key={user.user_id} className="p-2 bg-gray-100 rounded">
                  {user.name} (Email: {user.email}, Rating: {user.rating})
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Add New User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              name="user_id"
              value={newUser.user_id}
              onChange={handleInputChange}
              placeholder="User ID"
              required
            />
            <Input
              type="text"
              name="name"
              value={newUser.name}
              onChange={handleInputChange}
              placeholder="Name"
              required
            />
            <Input
              type="email"
              name="email"
              value={newUser.email}
              onChange={handleInputChange}
              placeholder="Email"
              required
            />
            <Input
              type="text"
              name="password_hash"
              value={newUser.password_hash}
              onChange={handleInputChange}
              placeholder="Password Hash"
              required
            />
            <Button type="submit">Add User</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default UserList;
