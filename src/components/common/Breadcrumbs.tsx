import React from "react";
import { HStack, Text, Link as ChakraLink } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <HStack
      as="nav"
      aria-label="Breadcrumbs"
      gap="1.5"
      fontSize="xs"
      color="fg.muted"
      wrap="wrap"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1 || item.isCurrent;

        return (
          <React.Fragment key={index}>
            {index > 0 && (
              <ChevronRight size={13} style={{ opacity: 0.6, flexShrink: 0 }} />
            )}
            {isLast ? (
              <Text
                fontWeight="500"
                color="fg.default"
                aria-current="page"
              >
                {item.label}
              </Text>
            ) : item.href ? (
              <ChakraLink
                asChild
                color="fg.muted"
                _hover={{ color: "blue.600", textDecoration: "none" }}
                transition="color 0.15s"
              >
                <RouterLink to={item.href}>{item.label}</RouterLink>
              </ChakraLink>
            ) : (
              <Text color="fg.muted">{item.label}</Text>
            )}
          </React.Fragment>
        );
      })}
    </HStack>
  );
};

export default Breadcrumbs;
