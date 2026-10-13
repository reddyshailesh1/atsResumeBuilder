import pytest
from app.services.ai_assistant import ai_service

@pytest.mark.asyncio
async def test_ai_service_requires_consent():
    with pytest.raises(ValueError):
        await ai_service.polish_summary("Experienced engineer", consent=False)

    with pytest.raises(ValueError):
        await ai_service.rewrite_bullet("Built an API", consent=False)

@pytest.mark.asyncio
async def test_ai_heuristic_summary_polish():
    raw_summary = "I am a backend developer who likes working on databases"
    res = await ai_service.polish_summary(raw_summary, target_role="Backend Specialist", consent=True)
    assert "polished" in res
    assert not res["polished"].lower().startswith("i am a")
    assert "Backend Specialist" in res["polished"]
    assert len(res["tips"]) > 0

@pytest.mark.asyncio
async def test_ai_heuristic_bullet_rewrite_with_quant_prompt():
    raw_bullet = "worked on database queries to make things faster"
    res = await ai_service.rewrite_bullet(raw_bullet, consent=True)
    assert len(res["suggestions"]) >= 2
    # Since bullet lacks explicit numbers, it should prompt the candidate for real metrics
    assert res["quantificationPrompt"] is not None
    assert "Engineered" in res["actionVerb"]
