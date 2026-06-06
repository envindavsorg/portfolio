import Link from "next/link";

import useAnimatedRef from "@/hooks/useAnimatedRef";
import type { Content } from "@/lib/content";
import { m } from "@/paraglide/messages";
import { localizeHref } from "@/paraglide/runtime";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../base/Tooltip";
import { ArrowLeft } from "../motion/ArrowLeft";
import { ArrowRight } from "../motion/ArrowRight";
import { Button } from "../primitives/Button";

interface WritingsPaginationProps {
  category: string | undefined;
  next: Content | null;
  previous: Content | null;
}

export const WritingsPagination = ({
  category,
  next,
  previous,
}: WritingsPaginationProps) => {
  const arrowLeft = useAnimatedRef();
  const arrowRight = useAnimatedRef();

  return (
    <div className="flex items-center gap-x-3">
      {previous && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                asChild
                onMouseEnter={arrowLeft.handleMouseEnter}
                onMouseLeave={arrowLeft.handleMouseLeave}
                size="icon"
                variant="outline"
              >
                <Link
                  aria-label={m.writings_pagination_previous_aria()}
                  href={localizeHref(`/${category}/${previous.slug}`)}
                >
                  <ArrowLeft ref={arrowLeft.ref} />
                  <span className="sr-only">
                    {m.writings_pagination_previous_sr()}
                  </span>
                </Link>
              </Button>
            }
          />
          <TooltipContent>
            <p>{previous.metadata.title}</p>
          </TooltipContent>
        </Tooltip>
      )}

      {next && (
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                asChild
                onMouseEnter={arrowRight.handleMouseEnter}
                onMouseLeave={arrowRight.handleMouseLeave}
                size="icon"
                variant="outline"
              >
                <Link
                  aria-label={m.writings_pagination_next_aria()}
                  href={localizeHref(`/${category}/${next.slug}`)}
                >
                  <ArrowRight ref={arrowRight.ref} />
                  <span className="sr-only">
                    {m.writings_pagination_next_sr()}
                  </span>
                </Link>
              </Button>
            }
          />
          <TooltipContent>
            <p>{next.metadata.title}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};
