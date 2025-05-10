import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, AlertTriangle, Star, UserCheck, ShoppingBag, Heart, Coins, ArrowLeftRight } from "lucide-react";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import type { User, Transaction, TransactionType } from "@/types/user";
import { Link } from "react-router-dom";

// Mock user data (replace with actual data when connected to backend)
const mockUser: User = {
  user_id: "1",
  name: "Phong",
  email: "phong@example.com",
  role: "Member",
  reputation_score: 75,
  violation_count: 0,
  rating: 4.5,
  status: "Active",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
};

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: 1,
    type: "Sale",
    item: "Physics Textbook",
    date: "2024-04-20",
    amount: "$45.00",
    status: "Completed",
    counterpartyName: "Jane Doe",
    itemId: "123"
  },
  {
    id: 2,
    type: "Donation",
    item: "School Supplies Bundle",
    date: "2024-04-15",
    amount: "-",
    status: "Completed",
    counterpartyName: "Education Foundation",
    itemId: "124"
  },
  {
    id: 3,
    type: "Fundraiser",
    item: "Science Lab Equipment",
    date: "2024-04-10",
    amount: "$25.00",
    status: "In Progress",
    counterpartyName: "City High School",
    itemId: "f125"
  },
  {
    id: 4,
    type: "Exchange",
    item: "History Textbook",
    date: "2024-04-05",
    amount: "Chemistry Textbook",
    status: "Completed",
    counterpartyName: "Mike Johnson",
    itemId: "126"
  },
  {
    id: 5,
    type: "Sale",
    item: "Graphing Calculator",
    date: "2024-04-01",
    amount: "$35.00",
    status: "Pending",
    counterpartyName: "Sarah Williams",
    itemId: "127"
  }
];

const Profile = () => {
  const [user] = useState<User>(mockUser);
  const [transactions] = useState<Transaction[]>(mockTransactions);
  const [currentTab, setCurrentTab] = useState<string>("all");

  const filteredTransactions = currentTab === "all" 
    ? transactions 
    : transactions.filter(transaction => transaction.type.toLowerCase() === currentTab.toLowerCase());

  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case "Sale":
        return <ShoppingBag className="h-4 w-4 text-blue-500" />;
      case "Donation":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "Fundraiser":
        return <Coins className="h-4 w-4 text-yellow-500" />;
      case "Exchange":
        return <ArrowLeftRight className="h-4 w-4 text-green-500" />;
      default:
        return <ShoppingBag className="h-4 w-4 text-blue-500" />;
    }
  };

  const renderAmountCell = (transaction: Transaction) => {
    if (transaction.type === "Exchange") {
      return <span className="text-sm">{transaction.amount}</span>;
    } else if (transaction.type === "Donation") {
      return <span className="text-sm text-muted-foreground">-</span>;
    } else {
      return <span className="text-sm font-medium">{transaction.amount}</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="container py-8 flex-1">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Profile Header */}
          <div className="flex items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2 mt-2">
                <Badge variant="secondary">{user.role}</Badge>
                <Badge variant={user.status === 'Active' ? 'default' : 'destructive'}>
                  {user.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rating</CardTitle>
                <Star className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.rating}/5.0</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reputation Score</CardTitle>
                <Award className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.reputation_score}/100</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Violations</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.violation_count}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <UserCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{user.status}</div>
              </CardContent>
            </Card>
          </div>

          {/* Activity List with Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="sale">Sales</TabsTrigger>
                  <TabsTrigger value="exchange">Exchanges</TabsTrigger>
                  <TabsTrigger value="donation">Donations</TabsTrigger>
                  <TabsTrigger value="fundraiser">Fundraisers</TabsTrigger>
                </TabsList>
                
                <TabsContent value={currentTab} className="mt-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>With</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount/Received</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTransactions.length > 0 ? (
                        filteredTransactions.map((transaction) => (
                          <TableRow key={transaction.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTransactionIcon(transaction.type)}
                                {transaction.type}
                              </div>
                            </TableCell>
                            <TableCell>{transaction.item}</TableCell>
                            <TableCell>{transaction.counterpartyName}</TableCell>
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>{renderAmountCell(transaction)}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={
                                  transaction.status === "Completed" ? "default" : 
                                  transaction.status === "Pending" ? "outline" :
                                  transaction.status === "In Progress" ? "secondary" : 
                                  "destructive"
                                }
                              >
                                {transaction.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {transaction.type === "Fundraiser" ? (
                                <Link to={`/fundraisers/${transaction.itemId?.replace('f', '')}`}>
                                  <Button variant="outline" size="sm">View</Button>
                                </Link>
                              ) : (
                                <Button variant="outline" size="sm">Details</Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                            No {currentTab !== "all" ? currentTab.toLowerCase() : ""} transactions found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  
                  {filteredTransactions.length > 5 && (
                    <Pagination className="mt-4">
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious href="#" />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#" isActive>1</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink href="#">2</PaginationLink>
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationNext href="#" />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
