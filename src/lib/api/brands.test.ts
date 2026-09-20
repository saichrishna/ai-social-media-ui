import { beforeEach, describe, expect, it, vi } from "vitest";

import { apiFetch } from "@/lib/api/client";
import {
  addVoiceSample,
  getInterviewAnswers,
  getVoiceSamples,
  saveInterviewAnswers,
} from "@/lib/api/brands";

vi.mock("@/lib/api/client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/api/client")>();
  return {
    ...actual,
    apiFetch: vi.fn(),
  };
});

const apiFetchMock = vi.mocked(apiFetch);

beforeEach(() => {
  apiFetchMock.mockReset();
  apiFetchMock.mockResolvedValue({ success: true });
});

describe("Brand DNA API client", () => {
  it("POSTs voice samples with user_id in query and body", async () => {
    await addVoiceSample("brand-1", "user-1", {
      source: "paste",
      content: "Real caption",
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/brand-profiles/brand-1/samples?user_id=user-1",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          user_id: "user-1",
          source: "paste",
          content: "Real caption",
        }),
      }),
    );
  });

  it("GETs voice samples with user_id", async () => {
    await getVoiceSamples("brand-1", "user-1");
    expect(apiFetchMock).toHaveBeenCalledWith(
      "/brand-profiles/brand-1/samples?user_id=user-1",
    );
  });

  it("PUTs interview answers with user_id", async () => {
    await saveInterviewAnswers("brand-1", "user-1", {
      answers: [
        {
          question_key: "customers_get_wrong",
          question_text: "What do customers get wrong?",
          answer_text: "They think we are expensive.",
          source: "type",
        },
      ],
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/brand-profiles/brand-1/interview-answers?user_id=user-1",
      expect.objectContaining({
        method: "PUT",
      }),
    );
  });

  it("GETs interview answers with user_id", async () => {
    await getInterviewAnswers("brand-1", "user-1");
    expect(apiFetchMock).toHaveBeenCalledWith(
      "/brand-profiles/brand-1/interview-answers?user_id=user-1",
    );
  });
});
