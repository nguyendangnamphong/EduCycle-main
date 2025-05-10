import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import ItemCard from "@/components/ItemCard";
import FundraiserCard from "@/components/FundraiserCard";
import { mockItems, mockFundraisers, categories } from "@/data/mockData";
import { Link } from "react-router-dom";
import { Folder, ArrowLeftRight, HandHeart, DollarSign } from "lucide-react";

const Index = () => {
  const featuredItems = mockItems.slice(0, 3);
  const featuredFundraisers = mockFundraisers.slice(0, 2);
  
  return <div className="flex flex-col min-h-screen">
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-educycle-green/90 to-educycle-blue/90 text-white py-16 md:py-24">
        <div className="container">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Reduce, Reuse, Recycle at School
            </h1>
            <p className="text-lg md:text-xl mb-8 opacity-90">
              Buy, sell, exchange, or donate school items within your community while supporting school fundraisers.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/browse">
                <Button size="lg" className="bg-white text-educycle-green hover:bg-gray-100">
                  Browse Items
                </Button>
              </Link>
              <Link to="/sell">
                <Button size="lg" variant="outline" className="border-white hover:bg-white/20 text-emerald-700">
                  Sell an Item
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How EduCycle Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-educycle-green/10 text-educycle-green mb-4">
                <DollarSign className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Sell</h3>
              <p className="text-muted-foreground">
                List your unused school items for sale. Set your price and help another student while making some money.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-educycle-yellow/10 text-educycle-yellow mb-4">
                <ArrowLeftRight className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Exchange</h3>
              <p className="text-muted-foreground">
                Trade items with other students. Get what you need and give what you don't in a sustainable swap.
              </p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-educycle-blue/10 text-educycle-blue mb-4">
                <HandHeart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">Donate</h3>
              <p className="text-muted-foreground">
                Give items you no longer need to someone who could use them, or support school fundraising campaigns.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Items */}
      <section className="py-16">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Featured Items</h2>
            <Link to="/browse">
              <Button variant="outline">View All Items</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredItems.map(item => <ItemCard key={item.post_id} {...item} image={item.image || "default-image-url"} />)}
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container">
          <h2 className="text-2xl font-bold mb-8">Browse by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map(category => <Link to={`/browse?category=${category}`} key={category} className="bg-white p-6 rounded-lg shadow-sm text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-3">
                  <Folder className="h-5 w-5" />
                </div>
                <h3 className="font-medium">{category}</h3>
              </Link>)}
          </div>
        </div>
      </section>
      
      {/* Featured Fundraisers */}
      <section className="py-16">
        <div className="container">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Active Fundraisers</h2>
            <Link to="/fundraisers">
              <Button variant="outline">View All Fundraisers</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredFundraisers.map(fundraiser => <FundraiserCard key={fundraiser.id} {...fundraiser} />)}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-educycle-blue/10">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-lg mb-8 max-w-xl mx-auto text-muted-foreground">
            Join our school community in promoting sustainability. Sell what you don't need, find what you do, and support important causes.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/signup">
              <Button size="lg" className="bg-educycle-green hover:bg-educycle-green/90">
                Join EduCycle
              </Button>
            </Link>
            <Link to="/browse">
              <Button size="lg" variant="outline">
                Explore Items
              </Button>
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>;
};
export default Index;
