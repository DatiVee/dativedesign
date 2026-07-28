import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "sonner";
import { CartProvider } from "@/contexts/CartContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { OrderFlowProvider } from "@/contexts/OrderFlowContext";
import { services } from "@/data/siteContent";
import Home from "@/pages/Home";
import { Route, Switch, useLocation } from "wouter";

// Strona główna ładuje się od razu (LCP); reszta tras jest dzielona na osobne chunki.
const About = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPostPage = lazy(() => import("@/pages/BlogPost"));
const OrderBriefPage = lazy(() => import("@/pages/OrderBrief"));
const CartPage = lazy(() => import("@/pages/Cart"));
const CheckoutPage = lazy(() => import("@/pages/Checkout"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const OrderPage = lazy(() => import("@/pages/Order"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const PortfolioDetail = lazy(() => import("@/pages/PortfolioDetail"));
const ReviewsPage = lazy(() => import("@/pages/ReviewsPage"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const Services = lazy(() => import("@/pages/Services"));
const ThankYouPage = lazy(() => import("@/pages/ThankYou"));

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location]);

  return null;
}

function RouteFallback() {
  return <div className="min-h-screen bg-background" aria-busy="true" />;
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
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
      </Suspense>
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
