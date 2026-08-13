"use client";

import type { ChangeEvent } from "react";
import { useMemo, useState } from "react";

import { Label } from "@/components/base/Label";
import { Badge } from "@/components/primitives/Badge";
import { Button, CopyButton } from "@/components/primitives/Button";
import { Textarea } from "@/components/primitives/Textarea";
import { formatDate } from "@/lib/functions";
import type { JwtErrorCode } from "@/lib/jwt";
import { decodeJwt } from "@/lib/jwt";
import { m } from "@/paraglide/messages";

const ERROR_MESSAGES: Record<JwtErrorCode, () => string> = {
  empty: () => "",
  invalid_base64: () => m.utils_jwt_error_base64(),
  invalid_json: () => m.utils_jwt_error_json(),
  malformed: () => m.utils_jwt_error_malformed(),
};

const pretty = (value: unknown): string =>
  JSON.stringify(value, null, 2);

interface SectionProps {
  title: string;
  content: string;
}

const Section = ({ title, content }: SectionProps) => (
  <div className="flex flex-col gap-y-2">
    <div className="flex items-center justify-between gap-x-2">
      <Label>{title}</Label>
      <CopyButton
        getValueAction={() => Promise.resolve(content)}
        label={m.utils_jwt_copy_aria({ section: title })}
        size="icon"
        variant="outline"
      />
    </div>
    <pre className="overflow-x-auto rounded-md border border-input p-3 font-mono text-xs">
      <code>{content}</code>
    </pre>
  </div>
);

export const JwtDecoder = () => {
  const [token, setToken] = useState("");

  const decoded = useMemo(() => decodeJwt(token), [token]);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) =>
    setToken(event.target.value);

  const error = decoded.ok ? null : decoded.error;
  const value = decoded.ok ? decoded.value : null;

  return (
    <div className="flex w-full flex-col gap-y-4 py-4">
      <div className="flex flex-col gap-y-2">
        <div className="flex items-center justify-between gap-x-2">
          <Label htmlFor="jwt-input">
            {m.utils_jwt_input_label()}
          </Label>
          {token && (
            <Button
              onClick={() => setToken("")}
              size="sm"
              variant="outline"
            >
              {m.utils_jwt_clear()}
            </Button>
          )}
        </div>

        <Textarea
          className="min-h-28 break-all font-mono text-xs"
          id="jwt-input"
          onChange={handleChange}
          placeholder={m.utils_jwt_input_placeholder()}
          spellCheck={false}
          value={token}
        />

        <p className="text-muted-foreground text-xs">
          {m.utils_jwt_privacy_notice()}
        </p>
      </div>

      {error && error !== "empty" && (
        <p className="text-destructive text-sm" role="alert">
          {ERROR_MESSAGES[error]()}
        </p>
      )}

      {value && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {typeof value.header.alg === "string" && (
              <Badge className="lowercase">
                {m.utils_jwt_badge_alg({
                  alg: value.header.alg,
                })}
              </Badge>
            )}

            {value.claims.expiresAt && (
              <Badge
                className={
                  value.claims.isExpired
                    ? "border-destructive text-destructive lowercase"
                    : "lowercase"
                }
                variant={
                  value.claims.isExpired ? "default" : "primary"
                }
              >
                {value.claims.isExpired
                  ? m.utils_jwt_badge_expired({
                      date: formatDate(
                        value.claims.expiresAt,
                        "DD MMM YYYY HH:mm"
                      ),
                    })
                  : m.utils_jwt_badge_valid_until({
                      date: formatDate(
                        value.claims.expiresAt,
                        "DD MMM YYYY HH:mm"
                      ),
                    })}
              </Badge>
            )}

            {value.claims.issuedAt && (
              <Badge className="lowercase">
                {m.utils_jwt_badge_issued({
                  date: formatDate(
                    value.claims.issuedAt,
                    "DD MMM YYYY HH:mm"
                  ),
                })}
              </Badge>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Section
              content={pretty(value.header)}
              title={m.utils_jwt_header_title()}
            />
            <Section
              content={pretty(value.payload)}
              title={m.utils_jwt_payload_title()}
            />
          </div>

          <div className="flex flex-col gap-y-2">
            <Label>{m.utils_jwt_signature_title()}</Label>
            <p className="break-all rounded-md border border-input p-3 font-mono text-xs">
              {value.signature || "—"}
            </p>
            <p className="text-muted-foreground text-xs">
              {m.utils_jwt_signature_notice()}
            </p>
          </div>
        </>
      )}
    </div>
  );
};
