import { describe, expect, test } from "bun:test";
import { parseDomainFromAccountData } from "./sns";

describe("parseDomainFromAccountData", () => {
  test("returns null for null data", () => {
    expect(parseDomainFromAccountData(null)).toBeNull();
  });

  test("returns null for undefined data", () => {
    expect(parseDomainFromAccountData(undefined)).toBeNull();
  });

  test("returns null for non-object data", () => {
    expect(parseDomainFromAccountData("string")).toBeNull();
    expect(parseDomainFromAccountData(42)).toBeNull();
  });

  test("returns null when data field is missing", () => {
    expect(parseDomainFromAccountData({})).toBeNull();
    expect(parseDomainFromAccountData({ data: undefined })).toBeNull();
  });

  test("returns null when base64 string is not a string", () => {
    expect(parseDomainFromAccountData({ data: [123, "base64"] })).toBeNull();
    expect(parseDomainFromAccountData({ data: [null, "base64"] })).toBeNull();
  });

  test("returns null when decoded data is too short (≤ 96 bytes header)", () => {
    // 96 bytes of zeros → exactly the header, no domain data
    const headerOnly = btoa(String.fromCharCode(...new Uint8Array(96)));
    expect(parseDomainFromAccountData({ data: [headerOnly, "base64"] })).toBeNull();
  });

  test("returns null when domain bytes are all zeros (empty name)", () => {
    // 96 header bytes + 4 zero bytes
    const bytes = new Uint8Array(100);
    const b64 = btoa(String.fromCharCode(...bytes));
    expect(parseDomainFromAccountData({ data: [b64, "base64"] })).toBeNull();
  });

  test("parses a valid domain from account data", () => {
    // 96 header bytes + "alice" encoded as UTF-8
    const header = new Uint8Array(96);
    const name = new TextEncoder().encode("alice");
    const bytes = new Uint8Array(header.length + name.length);
    bytes.set(header);
    bytes.set(name, header.length);

    const b64 = btoa(String.fromCharCode(...bytes));
    expect(parseDomainFromAccountData({ data: [b64, "base64"] })).toBe("alice.sol");
  });

  test("trims null bytes and whitespace from domain", () => {
    const header = new Uint8Array(96);
    const name = new TextEncoder().encode("bob\0\0\0");
    const bytes = new Uint8Array(header.length + name.length);
    bytes.set(header);
    bytes.set(name, header.length);

    const b64 = btoa(String.fromCharCode(...bytes));
    expect(parseDomainFromAccountData({ data: [b64, "base64"] })).toBe("bob.sol");
  });

  test("returns null for invalid base64", () => {
    expect(parseDomainFromAccountData({ data: ["!!!invalid!!!", "base64"] })).toBeNull();
  });
});
