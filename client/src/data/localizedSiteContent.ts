import type { Locale } from "@/lib/localeRoutes";
import {
  blogPosts,
  companyStats,
  faqs,
  getBlogPostBySlug,
  getFeaturedServices,
  getHomepageProjects,
  getProjectBySlug,
  getRelatedProjects,
  getServiceBySlug,
  projects,
  services,
  testimonials,
} from "./siteContent";
import {
  blogPostsEn,
  companyStatsEn,
  faqsEn,
  projectsEn,
  servicesEn,
  testimonialsEn,
} from "./siteContentEn";

export function getCompanyStats(locale: Locale) {
  return locale === "en" ? companyStatsEn : companyStats;
}

export function getServices(locale: Locale) {
  return locale === "en" ? servicesEn : services;
}

export function getServiceBySlugLocalized(locale: Locale, slug: string) {
  return locale === "en"
    ? servicesEn.find((service) => service.slug === slug)
    : getServiceBySlug(slug);
}

export function getFeaturedServicesLocalized(locale: Locale) {
  return locale === "en"
    ? servicesEn.filter((service) => service.featured)
    : getFeaturedServices();
}

export function getProjects(locale: Locale) {
  return locale === "en" ? projectsEn : projects;
}

export function getHomepageProjectsLocalized(locale: Locale) {
  return locale === "en" ? projectsEn.slice(0, 6) : getHomepageProjects();
}

export function getProjectBySlugLocalized(locale: Locale, slug: string) {
  return locale === "en"
    ? projectsEn.find((project) => project.slug === slug)
    : getProjectBySlug(slug);
}

export function getRelatedProjectsLocalized(locale: Locale, projectSlugs: string[]) {
  return locale === "en"
    ? projectsEn.filter((project) => projectSlugs.includes(project.slug))
    : getRelatedProjects(projectSlugs);
}

export function getTestimonials(locale: Locale) {
  return locale === "en" ? testimonialsEn : testimonials;
}

export function getFaqs(locale: Locale) {
  return locale === "en" ? faqsEn : faqs;
}

export function getBlogPosts(locale: Locale) {
  return locale === "en" ? blogPostsEn : blogPosts;
}

export function getBlogPostBySlugLocalized(locale: Locale, slug: string) {
  return locale === "en"
    ? blogPostsEn.find((post) => post.slug === slug)
    : getBlogPostBySlug(slug);
}
