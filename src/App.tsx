import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Home from "@/pages/Index";
import Browse from "@/pages/Browse";
import Fundraisers from "@/pages/Fundraisers";
import Sell from "@/pages/Sell";
import Login from "@/pages/Login";
import CreateActivity from "@/pages/CreateActivity";
import AdminPost from "@/pages/AdminItems";
import AdminUsers from "@/pages/AdminUsers";
import AdminDonation from "@/pages/AdminDonations";
import Profile from "@/pages/Profile";
import ItemDetails from "@/pages/ItemDetails";
import Index from "@/pages/Index";
import FundraiserDetails from "@/pages/FundraiserDetails";
import NotFound from "@/pages/NotFound";
import Report from "@/pages/Report"; // Import Report component
import { Toaster } from "sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const hideNav = location.pathname === "/login" || location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      {!hideNav && <Navigation />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<Layout><Login /></Layout>} />
        <Route path="/login" element={<Layout><Login /></Layout>} />
        <Route path="/home" element={<Layout><Home /></Layout>} />
        <Route path="/browse" element={<Layout><Browse /></Layout>} />
        <Route path="/fundraisers" element={<Layout><Fundraisers /></Layout>} />
        <Route path="/sell" element={<Layout><Sell /></Layout>} />
        <Route path="/create-activity" element={<Layout><CreateActivity /></Layout>} />
        <Route path="/admin/post" element={<Layout><AdminPost /></Layout>} />
        <Route path="/admin/items" element={<Layout><AdminPost /></Layout>} />
        <Route path="/admin/users" element={<Layout><AdminUsers /></Layout>} />
        <Route path="/admin/donations" element={<Layout><AdminDonation /></Layout>} />
        <Route path="/profile" element={<Layout><Profile /></Layout>} />
        <Route path="/item-details" element={<Layout><ItemDetails /></Layout>} />
        <Route path="/index" element={<Layout><Index /></Layout>} />
        <Route path="/fundraiser-details" element={<Layout><FundraiserDetails /></Layout>} />
        <Route path="/fundraisers/1" element={<Layout><FundraiserDetails /></Layout>} />
        <Route path="/fundraisers/2" element={<Layout><FundraiserDetails /></Layout>} />
        <Route path="/fundraisers/3" element={<Layout><FundraiserDetails /></Layout>} />
        <Route path="/admin/reports" element={<Layout><Report /></Layout>} /> {/* Thêm route cho Report */}
        <Route path="*" element={<Layout><NotFound /></Layout>} />
      </Routes>
    </Router>
  );
};

export default App;