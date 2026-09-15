# Design notes

There was one idea behind everything I did here. This is not a social network
about finance, it's one where opinions get checked against reality. The seed
shows it well: the @shortandlong thesis was voted down (96 up, 145 down) and
still turned out right. Votes tell you what people believed, the outcome tells
you what actually happened, and I tried to keep those two things separate and
visible the whole time.

## How I built it: spec-driven

I didn't jump straight into code. For each feature I wrote a short spec first
(requirements, then design, then tasks), built it, and wrote down the reasoning
in DECISIONS.md. That file is really the story of the project. Every gap in the
brief has a decision behind it that you can read and question. It kept the work
honest and easy to follow.

## Design: iOS / Apple feel

The look follows Apple's design ideas. It's a dark financial dashboard with real
squircle corners (not just rounded rectangles), layered shadows for depth, glass
surfaces on the header, nav and drawer, and a spring animation on the detail
panel. I kept color under control on purpose: one accent color, and green and red
used only for outcome and votes, so a color never means two different things.

## Gaps I filled

For telling an open thesis from a closed one I didn't rely on color alone. There
are three signals at once: a status badge, a colored accent bar, and a context
cell that shows "% to go" when it's open and the closing price when it's closed.

When a thesis closes, the votes freeze, because at that point the count is a
record of what the community believed. The detail view shows consensus and
outcome side by side, and adds a "Right against consensus" note when they don't
match, which is really the whole point of the product.

The score can go negative and I left it in a neutral color. The −49 thesis was
right, so painting it red would be telling a lie. And on currency, USD is always
the main price. The target is never converted, because otherwise it would look
closer or further from its goal without NVDA actually moving.

## Out of scope for a mockup

Some things I left out on purpose, all mocked behind a single API layer, which is
the only piece a real product would need to replace. There's no backend, no auth,
and the current user is a fixed @you. Real voting and comments would need
identity, rate limits and some abuse handling. The market data (price, market
cap, volume, ATH, the chart) is all mocked too, and in production it would come
from a real market data feed. Thesis resolution is hardcoded here, when in a real
product it would need a small rule engine: an "above" thesis can close early if
it hits the target, a "below" one only at the deadline.

If this were a real product, the first things I'd add are notifications when a
thesis you voted or commented on resolves, since that's the moment the product is
really about. Then a user profile with a track record, so reputation comes from
being right over time and not from being popular. After that, support for more
than one asset, with search and the option to follow assets, since right now the
whole app is just NVDA. And a proper accessibility pass tested with assistive
technology, since for now it's built to spec but not actually tested.
