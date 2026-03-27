import Link from "next/link";

import { dayjs } from "@/lib/functions";
import { cn } from "@/lib/utils";

import { MDX } from "../markdown/mdx";
import { Button } from "../primitives/Button";
import { Divider } from "../base/Divider";
import {
  Portal,
  PortalDialog,
  PortalDialogAction,
  PortalDialogClose,
  PortalDialogContent,
  PortalDialogDiv,
  PortalDialogOverlay,
  PortalDialogTitle,
  PortalImage,
  PortalImageWrapper,
  PortalTrigger,
} from "../primitives/Portal";

interface ArticleItemProps {
  slug: string;
  title: string;
  description?: string;
  image?: string;
  cover?: string;
  category?: string;
  reading: {
    time: string;
    words: number;
  };
  author?: string;
  createdAt?: Date;
  tags: string[] | undefined;
  content: string;
}

export const ArticleItem = ({
  slug,
  title,
  description,
  image,
  cover,
  category,
  reading,
  author,
  createdAt,
  tags,
  content,
}: ArticleItemProps) => (
  <>
    <Portal>
      <PortalTrigger>
        <PortalImageWrapper isBanner layoutId="116">
          <PortalImage
            alt={title}
            height={1280}
            src={image}
            whileHover={{ scale: 1.05 }}
            width={2800}
          />
        </PortalImageWrapper>
      </PortalTrigger>

      <PortalDialog>
        <PortalDialogContent>
          <PortalDialogClose />
          <PortalDialogAction />

          <Button
            asChild
            className="absolute top-4 right-55 z-50"
            variant="outline"
          >
            <Link
              aria-label={title}
              href={`${category?.toLowerCase()}/${slug}`}
              prefetch
            >
              lire l'article
            </Link>
          </Button>

          <PortalImageWrapper isGradient layoutId="116">
            <PortalImage
              alt={title}
              height={1280}
              src={cover}
              width={2800}
            />
          </PortalImageWrapper>

          <PortalDialogDiv
            className={cn(
              "absolute inset-0 z-10 h-130",
              "data-[open=true]:opacity-100",
              "data-[open=true]:delay-(--dialog-duration)",
              "data-[open=true]:duration-(--dialog-duration-40)",
              "data-[open=false]:opacity-0",
              "data-[open=false]:duration-(--dialog-duration-50)"
            )}
          >
            <PortalDialogTitle
              className="max-sm:hidden"
              description={description!}
              title={title}
            />
          </PortalDialogDiv>

          <PortalDialogDiv
            className={cn(
              "w-full p-4 pt-4 sm:p-8",
              "data-[open=true]:opacity-100",
              "data-[open=true]:delay-(--dialog-duration-80)",
              "data-[open=true]:duration-(--dialog-duration-40)",
              "data-[open=false]:opacity-0",
              "data-[open=false]:duration-(--dialog-duration-80"
            )}
          >
            <PortalDialogTitle
              className="pt-3 sm:hidden"
              description={description!}
              title={title}
            />

            <div className="mt-6 flex items-start justify-between gap-y-4 max-sm:flex-col">
              <div className="flex flex-col gap-y-1">
                <p className="font-medium text-foreground text-sm sm:text-base">
                  {author}
                </p>
                <p className="font-medium text-muted-foreground text-xs sm:text-sm">
                  écrit le{" "}
                  {dayjs(createdAt).format("dddd, DD MMMM YYYY")}
                </p>
              </div>

              <div className="flex w-fit flex-col gap-y-2 text-foreground text-xs sm:text-sm">
                <p className="text-theme">
                  <span className="mr-1 text-muted-foreground">
                    mis à jour :
                  </span>
                  {dayjs(createdAt).format("dddd, DD MMMM YYYY")}
                </p>
                <p className="text-theme">
                  <span className="mr-1 text-muted-foreground">
                    temps de lecture :
                  </span>
                  {reading.time}
                </p>
                <p className="text-theme">
                  <span className="mr-1 text-muted-foreground">
                    nombre de mots :
                  </span>
                  {reading.words} mots
                </p>
              </div>
            </div>

            <div className="space-y-6 pt-6 [&_.prose]:m-0! [&_.prose]:p-0!">
              <MDX
                code={`${content.slice(0, 300)}...`}
                isDivider={false}
              />

              <div className="space-y-2 border-t pt-3">
                <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                  tags :
                </p>
                <div className="flex flex-wrap gap-x-3 text-muted-foreground text-sm sm:gap-x-6">
                  {tags?.map((tag) => (
                    <span
                      className="font-medium text-foreground"
                      key={tag}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </PortalDialogDiv>
        </PortalDialogContent>
        <PortalDialogOverlay />
      </PortalDialog>
    </Portal>

    <Divider border={false} type="half" />
  </>
);
