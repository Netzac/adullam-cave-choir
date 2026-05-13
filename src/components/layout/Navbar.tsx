'use client';

import * as React from 'react';
import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { navLinks } from '@/config/site';
import { cn } from '@/lib/utils/cn';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from './ThemeToggle';
import { LocaleSwitcher } from './LocaleSwitcher';
import { Logo } from './Logo';

export function Navbar() {
  const t = useTranslations();
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 16));

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'sticky top-0 z-50 w-full transition-[background,box-shadow,border-color] duration-300',
        scrolled
          ? 'border-b border-border/60 bg-glass shadow-soft'
          : 'border-b border-transparent bg-background/0'
      )}
    >
      <div className="container flex h-16 items-center justify-between gap-4 md:h-20">
        <Logo />

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={cn(
                      'relative inline-flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors',
                      'hover:text-primary',
                      active ? 'text-primary' : 'text-foreground/80'
                    )}
                  >
                    {t(link.labelKey)}
                    {active && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-x-2 -bottom-px h-[2px] rounded-full bg-gradient-brand"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <div className="hidden md:flex items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>

          <Button
            asChild
            className="hidden md:inline-flex bg-gold hover:bg-gold-700 text-white shadow-glow-gold/40"
          >
            <Link href="/apply">{t('cta.applyNow')}</Link>
          </Button>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label={t('nav.openMenu')}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[88%] max-w-sm border-l-purple-900/30 p-0">
              <SheetTitle className="sr-only">{t('nav.openMenu')}</SheetTitle>

              <div className="flex h-full flex-col">
                <div className="border-b border-border/60 p-6">
                  <Logo showTagline />
                </div>

                <nav aria-label="Mobile primary" className="flex-1 overflow-y-auto p-2">
                  <ul className="flex flex-col">
                    <AnimatePresence>
                      {navLinks.map((link, i) => {
                        const active = pathname === link.href;
                        return (
                          <motion.li
                            key={link.href}
                            initial={{ opacity: 0, x: 16 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.04 * i, duration: 0.3 }}
                          >
                            <Link
                              href={link.href}
                              className={cn(
                                'flex items-center justify-between rounded-md px-4 py-3 text-base font-medium transition-colors',
                                active
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-foreground/90 hover:bg-accent/30'
                              )}
                            >
                              {t(link.labelKey)}
                              {active && (
                                <span className="h-1.5 w-1.5 rounded-full bg-gold" aria-hidden />
                              )}
                            </Link>
                          </motion.li>
                        );
                      })}
                    </AnimatePresence>
                  </ul>
                </nav>

                <div className="border-t border-border/60 p-4 space-y-3">
                  <Button
                    asChild
                    size="lg"
                    className="w-full bg-gold hover:bg-gold-700 text-white"
                  >
                    <Link href="/apply">{t('cta.applyNow')}</Link>
                  </Button>
                  <div className="flex items-center justify-between">
                    <LocaleSwitcher />
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  );
}
