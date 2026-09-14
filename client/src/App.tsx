import { lazy, Suspense, useEffect } from "react";
import { Toaster } from "sonner";
import { CartProvider } from "@/contexts/CartContext";
import { LocaleProvider } from "@/contexts/LocaleContext";
import { OrderFlowProvider } from "@/contexts/OrderFlowContext";
import { services } from "@/data/siteContent";
import Home from "@/pages/Home";
import { SHOP_ENABLED } from "@/siteConfig";
import { Redirect, Route, Switch, useLocation } from "wouter";

// Strona główna ładuje się od razu (LCP); reszta tras jest dzielona na osobne chunki.
const About = lazy(() => import("@/pages/About"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPostPage = lazy(() => import("@/pages/BlogPost"));
const OrderBriefPage = lazy(() => import("@/pages/OrderBrief"));
const CartPage = lazy(() => import("@/pages/Cart"));
const CheckoutPage = lazy(() => import("@/pages/Checkout"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
// Koncept 2026 strony głównej – ukryta trasa podglądowa (noindex), nie zastępuje "/".
const HomeConcept = lazy(() => import("@/pages/HomeConcept"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const OrderPage = lazy(() => import("@/pages/Order"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const PortfolioDetail = lazy(() => import("@/pages/PortfolioDetail"));
const ReviewsPage = lazy(() => import("@/pages/ReviewsPage"));
const ServiceDetail = lazy(() => import("@/pages/ServiceDetail"));
const Services = lazy(() => import("@/pages/Services"));
const ThankYouPage = lazy(() => import("@/pages/ThankYou"));

/**
 * Trasy sklepu (usługi, konfigurator, koszyk, checkout, brief, podziękowanie).
 * Przy SHOP_ENABLED === false każda z nich przekierowuje na stronę główną
 * w swojej wersji językowej – PL na "/", EN na "/en".
 */
const shopPathsPl = [
  "/uslugi",
  "/uslugi/:slug",
  ...services.map((service) => `/${service.slug}`),
  "/zamow-projekt",
  "/koszyk",
  "/checkout",
  "/brief-zamowienia",
  "/dziekujemy",
];

const shopPathsEn = [
  "/en/services",
  "/en/services/:slug",
  "/en/order",
  "/en/cart",
  "/en/checkout",
  "/en/order-brief",
  "/en/thank-you",
];

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    const { hash } = window.location;

    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    // Link typu "/#kontakt" z podstrony: nie skaczemy na górę, tylko po wyrenderowaniu
    // nowej trasy przewijamy do sekcji o danym id.
    const timer = window.setTimeout(() => {
      document
        .getElementById(decodeURIComponent(hash.slice(1)))
        ?.scrollIntoView({ behavior: "instant", block: "start" });
    }, 50);

    return () => window.clearTimeout(timer);
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
          <Route path="/koncept" component={HomeConcept} />
          <Route path="/en/concept" component={HomeConcept} />
          <Route path="/o-nas" component={About} />
          <Route path="/en/about" component={About} />
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

          {SHOP_ENABLED ? (
            <>
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
            </>
          ) : (
            <>
              {shopPathsPl.map((path) => (
                <Route key={path} path={path}>
                  <Redirect to="/" replace />
                </Route>
              ))}
              {shopPathsEn.map((path) => (
                <Route key={path} path={path}>
                  <Redirect to="/en" replace />
                </Route>
              ))}
            </>
          )}

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
