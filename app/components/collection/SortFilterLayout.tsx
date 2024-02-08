import type {
  Filter,
  ProductFilter,
} from '@shopify/hydrogen/storefront-api-types';

import {useLocation, useNavigate} from '@remix-run/react';
import {AnimatePresence, m} from 'framer-motion';
import {useCallback, useState} from 'react';

import {useOptimisticNavigationData} from '~/hooks/useOptimisticNavigationData';
import {type CmsSectionSettings} from '~/hooks/useSettingsCssVars';
import {cn} from '~/lib/utils';

import {IconFilters} from '../icons/IconFilters';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/Accordion';
import {Button} from '../ui/Button';
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTrigger,
} from '../ui/Drawer';
import {ScrollArea} from '../ui/ScrollArea';
import {DefaultFilter, PriceRangeFilter} from './Filter';
import {DesktopSort, MobileSort} from './Sort';

export type AppliedFilter = {
  filter: ProductFilter;
  label: string;
};

export type SortParam =
  | 'best-selling'
  | 'featured'
  | 'newest'
  | 'price-high-low'
  | 'price-low-high';

type Props = {
  appliedFilters?: AppliedFilter[];
  children: React.ReactNode;
  filters: Filter[];
  productsCount: number;
  sectionSettings?: CmsSectionSettings;
};

export const FILTER_URL_PREFIX = 'filter.';

export function SortFilter({
  appliedFilters = [],
  children,
  filters,
  productsCount,
  sectionSettings,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop layout */}
      <div className="hidden w-full touchdevice:hidden lg:flex lg:items-center lg:justify-between">
        <div className="flex items-center">
          <button className="py-2 pr-2" onClick={() => setIsOpen(!isOpen)}>
            <IconFilters />
          </button>
          {/*
            // Todo => add strings to themeContent
          */}
          <small className="flex items-center gap-1">
            <span className="[font-variant:tabular-nums]">{productsCount}</span>
            <span>products</span>
          </small>
        </div>
        <DesktopSort sectionSettings={sectionSettings} />
      </div>
      <div className="relative lg:flex lg:flex-row lg:flex-wrap">
        <div className="mt-6">
          <div
            className={cn([
              'hidden touchdevice:hidden lg:block',
              'transition-all duration-200',
              isOpen
                ? 'sticky top-[calc(var(--desktopHeaderHeight)_+_1rem)] opacity-100 md:w-[240px] md:min-w-[240px] md:pr-8'
                : 'max-h-0 pr-0 opacity-0 md:max-h-full md:w-[0px] md:min-w-[0px]',
            ])}
          >
            <DesktopFiltersDrawer
              appliedFilters={appliedFilters}
              filters={filters}
            />
          </div>
        </div>
        <MobileDrawer appliedFilters={appliedFilters} filters={filters} />
        <div className="lg:flex-1">{children}</div>
      </div>
    </>
  );
}

function MobileDrawer({
  appliedFilters,
  filters,
}: {
  appliedFilters: AppliedFilter[];
  filters: Filter[];
}) {
  const [open, setOpen] = useState(false);
  // Todo => add strings to themeContent
  const heading = 'Filter and Sort';
  const navigate = useNavigate();
  const {pathname} = useLocation();
  const {optimisticData, pending} =
    useOptimisticNavigationData<boolean>('clear-all-filters');

  // Here we can optimistically clear all filters and close DrawerFooter
  if (optimisticData) {
    appliedFilters = [];
  }

  const handleClearFilters = useCallback(() => {
    navigate(pathname, {
      preventScrollReset: true,
      replace: true,
      // Set optimistic data to clear all filters
      state: {
        optimisticData: true,
        optimisticId: 'clear-all-filters',
      },
    });
  }, [navigate, pathname]);

  return (
    <div className="touchdevice:block lg:hidden">
      <Drawer onOpenChange={setOpen} open={open}>
        <DrawerTrigger className="flex items-center gap-2">
          <IconFilters />
          <span>{heading}</span>
        </DrawerTrigger>
        <DrawerContent
          className={cn([
            'h-[--dialog-content-height] max-h-screen w-screen bg-background p-0 text-foreground',
            '[--dialog-content-height:calc(100dvh_*_.95)] [--dialog-content-max-width:calc(32rem)]',
            'lg:left-auto lg:right-0 lg:max-w-[--dialog-content-max-width] lg:[--dialog-content-height:100dvh]',
          ])}
          onCloseAutoFocus={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DrawerHeader className="border-b text-xl font-medium">
            {heading}
          </DrawerHeader>
          <div className="size-full overflow-hidden">
            <ScrollArea className="size-full px-6">
              <div className="pt-6">
                <MobileSort />
              </div>
              <div className="pr-1">
                {filters.map((filter: Filter) => (
                  <div className="my-8 border-t pt-8" key={filter.id}>
                    <div className="text-xl font-medium">{filter.label}</div>
                    <ul className="mt-3" key={filter.id}>
                      {filter.values?.map((option) => {
                        return (
                          <li className="[&_label]:py-3" key={option.id}>
                            {filterMarkup(filter, option, appliedFilters)}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
          <AnimatePresence>
            {appliedFilters.length > 0 && (
              <div>
                <m.div
                  animate={{
                    height: 'auto',
                  }}
                  className="overflow-hidden"
                  exit={{
                    height: 0,
                  }}
                  initial={{
                    height: 0,
                  }}
                >
                  <DrawerFooter className="grid grid-flow-col grid-cols-2 items-center justify-center gap-5 border-t py-6">
                    <Button
                      className={cn([
                        'flex items-center gap-1',
                        pending &&
                          'pointer-events-none animate-pulse delay-500',
                      ])}
                      onClick={handleClearFilters}
                      variant="ghost"
                    >
                      {/* // Todo => add strings to themeContent */}
                      <span>Clear</span>
                      <span className="[font-variant:tabular-nums]">
                        ({appliedFilters.length})
                      </span>
                    </Button>
                    <Button onClick={() => setOpen(false)}>
                      {/* // Todo => add strings to themeContent */}
                      Apply
                    </Button>
                  </DrawerFooter>
                </m.div>
              </div>
            )}
          </AnimatePresence>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export function DesktopFiltersDrawer({
  appliedFilters = [],
  filters = [],
}: Omit<Props, 'children' | 'productsCount'>) {
  return (
    <ScrollArea className="h-[calc(100dvh_-_var(--desktopHeaderHeight)_-2rem)] w-full rounded-md border p-4 pt-0 transition-all">
      <nav>
        <Accordion
          // Open filters by default
          defaultValue={filters.map((filter) => filter.id)}
          type="multiple"
        >
          {filters.map((filter: Filter) => (
            <AccordionItem key={filter.id} value={filter.id}>
              <AccordionTrigger>{filter.label}</AccordionTrigger>
              <AccordionContent>
                <ul className="py-2" key={filter.id}>
                  {filter.values?.map((option) => {
                    return (
                      <li className="pb-4" key={option.id}>
                        {filterMarkup(filter, option, appliedFilters)}
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </nav>
    </ScrollArea>
  );
}

const filterMarkup = (
  filter: Filter,
  option: Filter['values'][0],
  appliedFilters: AppliedFilter[],
) => {
  switch (filter.type) {
    case 'PRICE_RANGE':
      return <PriceRangeFilter />;

    default:
      return <DefaultFilter appliedFilters={appliedFilters} option={option} />;
  }
};