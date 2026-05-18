import { useEffect } from "react";
import { Toaster } from "sonner";
import { CartProvider } from "@/contexts/CartContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { OrderFlowProvider } from "@/contexts/OrderFlowContext";
import About from "@/pages/About";
import Blog from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPost";
import OrderBriefPage from "@/pages/OrderBrief";
import CartPage from "@/pages/Cart";
import CheckoutPage from "@/pages/Checkout";
import { services } from "@/data/siteContent";
import FAQPage from "@/pages/FAQPage";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import OrderPage from "@/pages/Order";
import Portfolio from "@/pages/Portfolio";
import PortfolioDetail from "@/pages/PortfolioDetail";
import ReviewsPage from "@/pages/ReviewsPage";
import ServiceDetail from "@/pages/ServiceDetail";
import Services from "@/pages/Services";
import ThankYouPage from "@/pages/ThankYou";
import { Route, Switch, useLocation } from "wouter";

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/en" component={Home} />
        <Route path="/o-nas" component={About} />
        <Route path="/en/about" component={About} />
        <Route path="/uslugi" component={Services} />
        <Route path="/en/services" component={Services} />
        <Route path="/uslugi/:slug">
          <ServiceDetail />
        </Route>
        <Route path="/en/services/:slug">
          <ServiceDetail />
        </Route>
        {services.map((service) => (
          <Route key={service.slug} path={`/${service.slug}`}>
            <ServiceDetail forcedSlug={service.slug} />
          </Route>
        ))}
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/en/portfolio" component={Portfolio} />
        <Route path="/portfolio/:slug" component={PortfolioDetail} />
        <Route path="/en/portfolio/:slug" component={PortfolioDetail} />
        <Route path="/opinie" component={ReviewsPage} />
        <Route path="/en/reviews" component={ReviewsPage} />
        <Route path="/faq" component={FAQPage} />
        <Route path="/en/faq" component={FAQPage} />
        <Route path="/blog" component={Blog} />
        <Route path="/en/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPostPage} />
        <Route path="/en/blog/:slug" component={BlogPostPage} />
        <Route path="/zamow-projekt" component={OrderPage} />
        <Route path="/en/order" component={OrderPage} />
        <Route path="/koszyk" component={CartPage} />
        <Route path="/en/cart" component={CartPage} />
        <Route path="/checkout" component={CheckoutPage} />
        <Route path="/en/checkout" component={CheckoutPage} />
        <Route path="/brief-zamowienia" component={OrderBriefPage} />
        <Route path="/en/order-brief" component={OrderBriefPage} />
        <Route path="/dziekujemy" component={ThankYouPage} />
        <Route path="/en/thank-you" component={ThankYouPage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <CartProvider>
      <OrderFlowProvider>
        <LocaleProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </LocaleProvider>
      </OrderFlowProvider>
    </CartProvider>
  );
}

export default App;
