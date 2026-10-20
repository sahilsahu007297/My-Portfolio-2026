# What does the company owe you?

A leave request has a submission date. A promised salary review has an owner. A question waiting for a manager has an age. These are small details, but they describe a side of work that can disappear in an HR dashboard: the things an organisation has not yet done for its people.

I designed and built Teamio around that question. The ambition is an HRMS that makes routine work easier while helping teams notice unresolved commitments and respond to them. The current product is an interactive local demo. The case study combines the prototype with my product and architecture notes; it does not claim a proven improvement in retention.

## 01 / Start with the everyday exchange

Employee records, leave, attendance and payroll give an HRMS its foundation. My notes began there, but the more interesting question was what an employee gets back from using it.

A daily check-in asks someone to contribute information. If nothing useful follows, the interaction becomes another task. I wanted the same experience to show what is moving on the employee’s behalf: a request, a response, a commitment or a next step.

That led to two connected ideas. Make it easy for employees to say how work is feeling, if they choose to. Make it difficult for an unanswered commitment to disappear without an owner.

## 02 / Accountability before prediction

The strongest early feature in the notes was Decision Debt. It does not need a predictive model. It needs a record of a request, the person responsible, an expected response time and a history of what happened.

In the demo, the employee view can surface items such as a promised raise or overdue feedback, with their age and an option to nudge the owner. These are sample scenarios. Their purpose is to show the interaction: an employee can see a commitment instead of relying on memory or another private follow-up.

I would keep “overdue” precise. It should mean an agreed response window has passed, not that the system has judged a manager’s intent. A changed deadline should be visible with a reason. Resolving the item should leave a history rather than simply removing the evidence.

The design creates a useful management question: which decisions am I holding up, and what can I do about them today?

## 03 / A check-in is a choice, not a score

Mood can help start a conversation, but it is easy to give it too much authority. One difficult morning does not establish burnout. Silence does not mean disengagement. Participation should not become a proxy for performance.

The demo makes the check-in optional and asks for an explicit opt-in. Its local implementation keeps employee notes in the employee view. The manager examples use seeded team-level data; a live text classifier is not connected.

I want those boundaries to be part of the interface. Before someone shares, they should understand who can see the response and what the product will do with it. An employee should also be able to skip without being pressured by streaks or alarming messages.

The notes propose suppressing team summaries below five contributors. I treat that as an initial design rule, not a guarantee of anonymity. Small teams, distinctive incidents and repeated filters can still reveal people. Any production aggregation needs a careful review of those cases, as well as clear consent and deletion behaviour.

## 04 / Different people need different views

An employee needs today’s work, a request’s status and a way to ask for an explanation. A manager needs the decisions they own and a useful next action. HR needs policy controls and a reliable history. Leadership needs a view of patterns without opening private employee notes.

Teamio’s demo lets these perspectives be explored through employee, manager, HR/admin and leadership personas. The data is illustrative and stored locally. Switching personas demonstrates the intended experience; it is not proof of production authentication or access control.

That distinction shapes the next build. Permissions must be enforced by the service, not just by hiding a tab. A manager should not be able to retrieve private notes through a different route. Every sensitive action needs a clear reason and an appropriate record.

I would also resist giving every role the same dashboard with a different heading. A useful employee home might be almost quiet. A useful HR view may need more detail, but only when that detail supports a task.

## 05 / Explain the decision, and leave a way back

An approved or rejected label records an outcome. It does not always explain what the employee can do next. The current Accountability view requires an explanation for decisions and shows an appeal option on a declined request. That makes the principle visible in the local demo.

For a leave request, that could mean showing the coverage constraint and suggesting an alternative date. For an unresolved commitment, it could mean naming the owner and the revised response time. I would use the same pattern across requests so that explanations are expected rather than exceptional.

An appeal should create a trackable item, not send the employee into an unstructured message thread. It should also avoid promising that every decision can be reversed. The useful promise is that a question has been received and someone is responsible for answering it.

## 06 / Give every signal a next step

The current demo includes a Company health view with seeded workload signals, a Burnout Radar and an Attrition Weather Forecast. The forecast explicitly describes a rule-based attention level, not an exit probability, and says historical exit outcomes are unavailable. These screens demonstrate the intended review process; they do not establish predictive accuracy.

A meeting-cost estimate can begin with duration and attendance, provided its assumptions are visible. A reminder about an overdue approval can begin with timestamps. A claim about an individual’s likelihood of leaving is a very different proposition: it requires suitable historical data, validation and an assessment of how the prediction might be used.

For that reason, I would begin with explainable operational signals. “Three requests are awaiting your response” is actionable and inspectable. An unexplained risk score is neither. The manager should be able to see what produced a signal, correct bad inputs and record the action taken.

AI assistance is part of the product direction, particularly for summarising information and helping people find an answer. The current demo does not establish a validated attrition model or a working sentiment-analysis service. I would not describe it as predicting resignations accurately.

## 07 / Build the history before the intelligence

The proposed architecture starts with an event history: request raised, assigned, answered, appealed and closed. Derived team signals would sit above that history, with their inputs and time windows recorded.

This matters because a final status alone loses the waiting time. “Approved” cannot tell us whether the response took two hours or two weeks. The same history can support a request tracker, a manager’s open commitments and an audit view without inventing separate versions of the event.

Calendar and work-tool integrations are proposed sources for later operational context. They are not verified live integrations in this case study. I would connect only the data needed for an agreed use, with a clear failure state when a connection becomes stale.

## 08 / The pilot I would run

I would begin with a small design-partner pilot focused on requests and commitments. Adding every proposed module at once would make it hard to learn what people actually value.

Employees would test whether they can find the status of a request, understand who sees a check-in and ask for an explanation without help. Managers would test whether they can identify an overdue item and resolve it with enough context. HR would test whether the record agrees across those views.

The first measures would be response time, age of unresolved commitments, repeated follow-ups and clarity of explanations. For check-ins, I would look at voluntary participation alongside whether employees understand the privacy boundary. High participation would not count as a success if people felt obliged to contribute.

Retention would take longer to assess. I would need a baseline, sufficient time and a way to account for organisational changes before attributing any improvement to Teamio. Until then, the honest claim is that the product is designed to address problems that may contribute to people leaving.

## 09 / Monetisation: the employer pays for dependable workflows

The app's Pitch & readiness view proposes per-employee-per-month subscriptions, with Core and Intelligence tiers. I would test that employer-paid model in a design-partner pilot before setting prices. This is a proposed pricing structure, not a live plan or a claim that Teamio has paying customers. The local demo does not establish subscription billing.

The buyer would be the person responsible for HR operations or the business owner. Employees would use the product as part of that organisation's subscription. I would not charge employees to see a decision, ask for an explanation or understand who can see their check-in.

The first paid scope should be narrow enough to support reliably: employee records, request tracking, ownership, explanations and an auditable history, once those workflows are implemented with production access controls and persistence. The demo demonstrates the intended interactions; it is not evidence that production payroll, attendance hardware or external work-tool integrations are ready to sell.

A fixed onboarding fee could cover agreed migration and setup work where it actually exists. It should buy a defined deliverable, not conceal a product that needs open-ended custom development for each customer. More advanced reporting or integrations could become optional paid modules only after they work and have support coverage.

I would not put a premium on individual “flight risk” scores. The predictive ideas in the roadmap have not been validated, and charging for them would get ahead of the evidence. Nor would I make consent controls, private-note boundaries or explanations an expensive upgrade.

## 10 / What an employer should get back

The nearest-term business benefit is less time lost to unanswered requests and repeated follow-ups. A visible owner and due date could help HR and managers resolve work sooner; a clear explanation could reduce the need to ask the same question in several places. Those are testable benefits, not outcomes already achieved by the demo.

For a pilot, I would record request volume, median response time, overdue items and follow-up effort before introducing the workflow. Then I would compare the same measures over a similar period, checking for changes in staffing or workload. I would also check resolution quality: a fast rejection with no useful explanation is not an improvement.

An employer could estimate capacity released as time saved per comparable request, multiplied by request volume and an agreed loaded hourly cost. That is a value estimate, not necessarily cash saved. If no paid hours or external costs are removed, I would describe it as time available for other work.

The subscription has to cost less than the value the customer can defend. For Teamio itself, recurring revenue must cover hosting, support, onboarding effort, account management and any paid integrations. A pilot that requires constant manual intervention may reveal demand while still being commercially unsustainable.

Lower employee turnover is a longer-term hypothesis. I would not convert an improved mood trend into “employees retained” or claim recruitment-cost savings without evidence that departures changed for reasons attributable to the product. The first sale should stand on dependable workflows and less avoidable waiting.

## 11 / What I chose to leave for later

The local demo also presents growth, gigs, a work passport and team forecasting concepts. Production versions would need verified records, enforceable permissions and, for forecasting, validated data and models. Those additions should not distract from an unanswered request in the first paid version.

My priority is a dependable exchange: employees can complete everyday tasks, see what is owed to them and understand how their information is used. Managers get a manageable set of actions rather than a collection of alarming charts.

Teamio’s distinctive idea is straightforward. An HR system should keep a record of the organisation’s responsibilities too. The local demo makes that direction tangible; a production pilot is the next step toward finding out whether it improves daily work.
