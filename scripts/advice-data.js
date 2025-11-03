export const ADVICE_DATA = [
  {
    "question": "How do I 'do' LeETCode? Just solve random problems?",
    "answer": "No. That's inefficient. Focus on patterns. Master one pattern at a time, like 'Sliding Window' or 'Two Pointers'. Solve 5-10 problems on that pattern until you see it instantly. Then move on. Quality over quantity. The 'NeetCode 150' or 'Blind 75' lists are a good structure."
  },
  {
    "question": "What's the most common mistake candidates make in algorithm interviews?",
    "answer": "Jumping straight to code. They hear the problem and start typing. Wrong. First, clarify requirements. Second, define your test cases, including edge cases. Third, explain your high-level approach and its Big-O. *Then* you write code."
  },
  {
    "question": "How many LeetCode problems should I solve to be ready?",
    "answer": "It's not the number. I've seen candidates who solved 500+ and failed, and candidates who solved 150 *targeted* problems and passed. If you deeply understand the core patterns and can solve unseen Mediums in 30-40 minutes, you're ready."
  },
  {
    "question": "How important is Big-O notation *really*?",
    "answer": "It's the language we use to discuss performance. If you can't tell me the difference between an $O(N \\log N)$ and an $O(N^2)$ solution, the interview is over. It's not academic; it's the difference between a feature that works and one that crashes the service at scale."
  },
  {
    "question": "Should I memorize solutions?",
    "answer": "Absolutely not. Memorizing is a red flag. You must understand the *why*. Why this data structure? What are the trade-offs? If you get a slight variation of a problem, you'll fail. We're testing problem-solving, not memory."
  },
  {
    "question": "What do I do if I get stuck on a problem for hours?",
    "answer": "Timebox it. 45 minutes, max. After that, look at the solution. But don't just read it and move on. *Understand* it. Code it yourself from scratch. Then, bookmark it and re-solve it two days later without looking. This is non-negotiable."
  },
  {
    "question": "What language should I use in the interview?",
    "answer": "The one you are fastest and most comfortable with, as long as it's not esoteric. Python or Java are standard. Python is often faster for string manipulation and has simpler data structure literals. C++ is fine, but be prepared to manage memory and be more verbose."
  },
  {
    "question": "LeetCode Easy, Medium, or Hard?",
    "answer": "Your target is Medium. Easy is a warm-up. Hard is for specialized roles or competitive programming. You must be able to solve a new Medium-level problem, bug-free, in about 30-40 minutes while explaining your thoughts."
  },
  {
    "question": "How do I show algorithm skills on my resume if I'm a new grad?",
    "answer": "Projects. And not a 'To-Do List' app. Show a project that required a non-trivial algorithm. 'Built a route-finding visualizer using Dijkstra's algorithm' or 'Implemented a simple full-text search engine using a Trie.' Quantify the result if you can."
  },
  {
    "question": "What if I can't find the optimal solution during the interview?",
    "answer": "Start with the brute-force solution. A working, suboptimal solution is infinitely better than a failed attempt at an optimal one. State its (bad) time complexity, and then say, 'This is $O(N^2)$. I know I can do better, let's optimize by...' This shows a clear, structured thought process."
  },
  {
    "question": "How do I 'think out loud' without sounding stupid?",
    "answer": "Narrate your *decisions*, not just your random thoughts. Not: 'Hmm, maybe an array? No, a hash map? I don't know...' Yes: 'I'm considering a hash map here because I need $O(1)$ lookups for the complement, which is critical for the time complexity.'"
  },
  {
    "question": "What's the most underrated data structure?",
    "answer": "The Trie. It's not just for 'autocomplete'. It's incredibly fast for any prefix-based search, IP routing tables, and certain string problems. Most candidates forget it exists. The other is the Union-Find (Disjoint Set), which is a silver bullet for connectivity problems."
  },
  {
    "question": "How do I handle a problem I've never seen before?",
    "answer": "You *will* get problems you've never seen. We're testing your problem-solving. Break it down. Relate it to patterns you *do* know. Is it a graph problem in disguise? A DP problem? Talk through your thought process. A good 'I don't know, but here's how I'd approach it' is better than silence."
  },
  {
    "question": "How do I balance speed vs. clean code in an interview?",
    "answer": "Clean code *is* speed. Use meaningful variable names (e.g., `left_pointer` not `i` or `j`). Write small helper functions. A 50-line monolithic function is impossible to debug under pressure. A clean, modular solution is faster to write correctly and faster to fix."
  },
  {
    "question": "What's the difference between $O(N)$ and $O(1)$ space?",
    "answer": "$O(1)$ space, or 'in-place', means you're modifying the input or using a fixed number of extra variables. $O(N)$ space means you're creating a new data structure (like a hash map or a copy of the array) that scales with the size of the input. We *always* prefer $O(1)$ space if the time complexity is a tie."
  },
  {
    "question": "How should I practice for the system design interview?",
    "answer": "That's about trade-offs at scale. Read 'Designing Data-Intensive Applications.' Practice by designing common systems: Twitter, a URL shortener, Uber. Focus on availability, scalability, and latency. Draw boxes, define APIs, and justify every choice (e.g., 'I chose Kafka here over RabbitMQ because...')."
  },
  {
    "question": "Is it okay to use built-in library functions?",
    "answer": "Ask. The default answer is yes, *unless* the function is the exact problem you're being asked to solve. 'Can I use a sorting function?' Yes. 'Can I use a 'reverse string' function to solve 'reverse a string'?' No. Show you know the time complexity of the function you're using."
  },
  {
    "question": "Should I ask for hints if I'm stuck?",
    "answer": "Don't ask 'I'm stuck, give me a hint.' Instead, say 'I'm considering approach A and approach B. I'm stuck on how to optimize A. Am I on the right track?' Show your work, then ask for a *course correction*. It shows you're collaborative, not just waiting to be fed the answer."
  },
  {
    "question": "I just don't get dynamic programming. Any advice?",
    "answer": "Stop trying to find a magic bottom-up formula. DP is just 'recursion with memoization.' Can you solve the problem recursively? If so, you're 90% there. Just add a cache (a hash map or array) to store results you've already computed. That's top-down DP. Start there. It's all you need for 99% of interviews."
  },
  {
    "question": "Does my GitHub profile matter for these roles?",
    "answer": "Yes, but only if it's good. A profile with well-structured, non-trivial projects (not just tutorial forks) and clean commit messages is a strong positive signal. A messy, inactive, or trivial GitHub is better left off your resume."
  },
  {
    "question": "What's the difference between a hash map and a balanced BST?",
    "answer": "A hash map gives you $O(1)$ *average* time for insertion, deletion, and search. A balanced BST (like an AVL or Red-Black tree) gives you $O(\\log N)$ *worst-case* time. The key trade-off: use a BST when you need your data to be ordered, like for a 'find next largest' query. If you just need key-value lookups, a hash map is almost always better."
  },
  {
    "question": "How much time should I spend on behavioral questions?",
    "answer": "At least 20%. A brilliant jerk is a net negative on a team. We will 'no-hire' a technical genius who is arrogant or cannot communicate. Prepare STAR (Situation, Task, Action, Result) stories for your projects. Be ready to talk about a conflict, a mistake, and a technical trade-off."
  },
  {
    "question": "What's the *real* goal of the algorithm interview?",
    "answer": "To get a signal on how you'll perform on the job. Can you take a vague problem, clarify it, design a solution, code it cleanly, test it, and explain its trade-offs? The algorithm is just the *medium* for that test. We're hiring problem-solvers, not LeetCode-solvers."
  },
  {
    "question": "When would I ever *really* use a linked list?",
    "answer": "When you need frequent, constant-time insertions and deletions in the *middle* of a sequence, and you do not need $O(1)$ random access. Think of the 'undo' stack in an editor, or managing free blocks in memory. Knowing the specific trade-off is the key."
  },
  {
    "question": "What's 'amortized analysis' in simple terms?",
    "answer": "It's the average cost of an operation over time. A 'dynamic array' or 'ArrayList' is the classic example. Adding an element is usually $O(1)$. But occasionally, it needs to resize, which is an $O(N)$ operation. Amortized analysis proves that over $N$ insertions, the *average* cost per insertion is still $O(1)$."
  },
  {
    "question": "How do I follow up on a problem after the interview?",
    "answer": "You don't. The interview is finished. But *you* should make a note of the problem. If you failed to solve it, go home and solve it. Understand it. You may see it again, and more importantly, it exposed a gap in your knowledge. Fix the gap."
  },
  {
    "question": "Any last-minute interview tips?",
    "answer": "Sleep. A tired brain makes stupid, unforced errors. And prepare good questions for *us*. 'What's the biggest technical challenge your team is facing?' or 'What does the code review process look like here?' shows you're engaged. 'What are the vacation policies?' does not."
  },
  {
    "question": "BFS vs. DFS: when do I use which?",
    "answer": "BFS (Breadth-First Search) finds the *shortest path* in an unweighted graph. It uses a queue. DFS (Depth-First Search) is better for *exploring* a graph, checking for connectivity, or finding cycles. It uses a stack (or recursion). For a 2D grid/maze problem, BFS is your go-to for shortest path."
  },
  {
    "question": "How do I test my code in an interview?",
    "answer": "Don't just say 'I'm done.' Say, 'Now I'm going to test my code.' Verbally walk through your test cases. Start with the 'happy path' example. Then test your edge cases: an empty array, a null input, a single-element list, a list with duplicates. Find your own bugs before the interviewer does."
  },
  {
    "question": "What's the deal with heaps (priority queues)?",
    "answer": "A heap is how you efficiently find the 'Top K' or 'min/max' element in a changing collection. It gives you $O(\\log N)$ insertion and $O(1)$ access to the min/max element (and $O(\\log N)$ to remove it). It's simpler than a BST. If you hear 'Top K', 'median of a stream', or 'Kth largest', think 'heap'."
  },
  {
    "question": "How do I even start preparing for a system design interview?",
    "answer": "Start with the components, not the entire system. Master one at a time. What *is* a load balancer? What are the algorithms (Round Robin, Least Connections)? What *is* a cache? What are the eviction policies (LRU, LFU)? What *is* a message queue? Build your-block-level knowledge first. Only then can you assemble them."
  },
  {
    "question": "What's the biggest mistake candidates make in system design interviews?",
    "answer": "Jumping to a solution. They don't spend the first 10 minutes clarifying requirements. You *must* define the problem before you solve it. What are the functional requirements? What are the non-functional ones? How many users? What's the QPS? What's the read/write ratio? Your design is meaningless without these constraints."
  },
  {
    "question": "SQL or NoSQL? How do I choose?",
    "answer": "It's the classic tradeoff. Do you need strict ACID compliance and your data is well-structured with complex joins? Use SQL (e.g., Postgres). Is your data unstructured, semi-structured, or do you need massive horizontal scalability and high write throughput? Use NoSQL (e.g., DynamoDB, Cassandra). The choice is driven by the data model and the read/write patterns."
  },
  {
    "question": "What resource do you recommend for learning system design?",
    "answer": "There is no single bible. For the deep *why*, read 'Designing Data-Intensive Applications' by Kleppmann. For interview-focused patterns, 'Grokking the System Design Interview' is a common start. But theory isn't enough. You must practice by whiteboarding systems with peers who will poke holes in your design. That's the real test."
  },
  {
    "question": "How important are back-of-the-envelope calculations?",
    "answer": "Critically important. They ground your design in reality. They're not about getting the exact number; they're about proving you understand orders of magnitude. Your QPS estimate dictates your caching strategy. Your storage estimate dictates your database choice. Without them, you're just guessing."
  },
  {
    "question": "Do I still need to grind LeetCode for a Staff Architect role?",
    "answer": "Yes, but the focus shifts. The bar for algorithm fundamentals never goes away. We need to know you can still identify an $O(N^2)$ bottleneck. But for a Staff role, you're more likely to get a 'design this API' or 'refactor this complex service' coding problem than a 'trick' algorithm problem. Clean, maintainable, efficient code is the signal."
  },
  {
    "question": "How does LeetCode practice actually help with system design?",
    "answer": "Indirectly, but fundamentally. It trains your mind to think about efficiency (Big-O) and data structures. Your choice of a hash map vs. a tree in a coding problem is a micro-version of choosing a database (Key-Value vs. B-Tree) in a system design problem. It's about a deep, instinctive understanding of data structures."
  },
  {
    "question": "What kind of LeetCode problems *are* relevant to system design?",
    "answer": "The problems that force you to *build* a data structure. 'Design an LRU Cache' is the classic. It's a mini-system-design problem. It requires a hash map and a doubly-linked list. Others like 'Design a Rate Limiter' (Token Bucket) or 'Implement a Trie' are also highly relevant."
  },
  {
    "question": "I'm great at system design but bad at LeetCode. Will that kill me?",
    "answer": "At a Senior level, yes. At a Staff level, it's more nuanced, but you still have to pass the coding rounds to *get* to the system design rounds. They are often separate gates. Your inability to write an efficient algorithm implies you can't be trusted to build an efficient, scalable system."
  },
  {
    "question": "How do I show 'system design' skills on my resume?",
    "answer": "With quantified impact at scale. Don't say 'Built a microservice.' Say, 'Architected a new caching service that reduced p95 API latency by 300ms, handling 10,000 QPS.' Use keywords: 'scaled,' 'architected,' 'migrated,' 'optimized.' Show the *result* of your design, not just the task."
  },
  {
    "question": "Why does Big-O notation matter in the real world?",
    "answer": "It's the difference between a system that scales and one that melts down. An $O(N^2)$ algorithm in a critical path *will* cause a full-site outage as $N$ grows. Big-O is the language we use to predict performance *before* we deploy code and cost the company millions."
  },
  {
    "question": "What's more important: time complexity or space complexity?",
    "answer": "It's a tradeoff. Historically, space was expensive. Today, memory is cheap, but latency is the new bottleneck. We almost always prioritize time complexity (customer experience) over space complexity... until the memory bill gets too high or you're designing for a resource-constrained environment like mobile."
  },
  {
    "question": "What's the CAP Theorem, and why should I care?",
    "answer": "It's the fundamental law of distributed systems. It states you can only have two of three: Consistency, Availability, and Partition Tolerance. Since network partitions *will* happen, your real choice is between Consistency (CP) and Availability (AP). Do you fail the request (CP, like a bank) or return potentially stale data (AP, like a social media feed)?"
  },
  {
    "question": "What's a good framework for answering any system design question?",
    "answer": "1. Clarify functional and non-functional requirements. 2. Make scale estimations (QPS, storage, bandwidth). 3. Design a high-level (V0) system. 4. Drill down into components (API, DB, Cache). 5. Identify bottlenecks and discuss tradeoffs. Always discuss tradeoffs."
  },
  {
    "question": "What if I get stuck or the interviewer points out a flaw?",
    "answer": "Don't get defensive. Get collaborative. Say, 'That's a great point. My assumption was X, which led me to this design. Let's re-evaluate that.' An interview is a test of collaboration as much as it is a test of knowledge. A candidate who can't take feedback is a 'no-hire'."
  },
  {
    "question": "What's the difference between horizontal and vertical scaling?",
    "answer": "Vertical scaling ('scaling up') means adding more power (CPU, RAM) to a single server. It's simple, but has a hard physical limit and gets expensive. Horizontal scaling ('scaling out') means adding more *servers* to your pool. It's harder to implement but has near-infinite scalability. Modern systems are built to scale horizontally."
  },
  {
    "question": "When do I need a message queue, like Kafka or RabbitMQ?",
    "answer": "When you need to decouple your services and move to asynchronous processing. If a service (e.g., 'Order') needs to tell three other services (e.g., 'Email,' 'Shipping,' 'Inventory') to do work, don't make it a synchronous API call. The 'Order' service just drops a message onto a queue and moves on. This improves resilience, latency, and scalability."
  },
  {
    "question": "What is database sharding?",
    "answer": "It's horizontal scaling for your database. When a single database server (even a vertically scaled one) can't handle the load, you split the *rows* of your data across multiple servers (shards). For example, Users A-M go to Shard 1, and Users N-Z go to Shard 2. This is extremely powerful but adds immense complexity in joins, transactions, and re-balancing."
  },
  {
    "question": "What's the difference between a load balancer and a reverse proxy?",
    "answer": "They are often the same device (e.g., Nginx, HAProxy), but serve different logical purposes. A Load Balancer *distributes* traffic across multiple identical backend servers. A Reverse Proxy is a single *gateway* for all traffic, handling SSL, caching, and routing to different *services*."
  },
  {
    "question": "How do I practice LeetCode 'effectively' from your perspective?",
    "answer": "Don't just solve random problems. Focus on the *data structure*. Master all the problems for Hash Maps. Then master Heaps. Then Graphs. A deep understanding of the *tool* (the data structure) and its time/space tradeoffs is what matters. Quality of understanding over quantity of problems."
  },
  {
    "question": "I'm a junior dev. How can my resume show 'architecture' skills?",
    "answer": "Show *ownership* and *understanding of tradeoffs*. Not: 'Worked on the auth service.' Instead: 'Owned the auth service token-refresh endpoint; refactored it to reduce database queries by 60%, which cut p99 latency by 50ms.' Even on a small scale, you can show you think about performance and impact."
  },
  {
    "question": "How many pages should my resume be?",
    "answer": "One. Always one. If you are a 20-year veteran with a dozen patents, *maybe* two. But for 99.9% of roles, it's one page. I am not reading a novel. I am pattern-matching for signals of scale, impact, and ownership. Be concise."
  },
  {
    "question": "What's the difference between $O(N)$ and $O(1)$ space?",
    "answer": "This isn't just academic. $O(1)$ space ('in-place') means you're modifying the input or using a fixed number of extra variables. $O(N)$ space means you're creating a new data structure that scales with the input size. In a high-traffic service, an $O(N)$ space algorithm can cause a memory leak or service-wide crash. We *always* prefer $O(1)$ space if the time complexity is a tie."
  },
  {
    "question": "Do I need to know specific technologies, like Kubernetes or specific AWS services?",
    "answer": "You need to know the *problem class* they solve. You don't need to be a Kubernetes expert, but you *must* know *why* you'd need a container orchestration system. You don't need to know every AWS service, but you must be able to discuss the tradeoffs between a managed service (like DynamoDB) and a self-hosted one (like Cassandra on EC2)."
  },
  {
    "question": "What's the most common interview mistake in the *coding* round?",
    "answer": "Jumping straight to code. The same mistake as in system design. Clarify the inputs. Define the outputs. State your edge cases *first*. Then, explain your high-level approach and its Big-O. *Then* you write code. This methodical process is what we're hiring for."
  },
  {
    "question": "What's a 'Trie' and when would I ever use it?",
    "answer": "A Trie is a tree-like data structure optimized for prefix-based string searches. It's not just an academic toy. It's the core data structure for 'autocomplete' or 'typeahead' services. Any time you need to efficiently query 'all strings starting with X', a Trie is the answer, providing $O(L)$ lookup time, where $L$ is the length of the prefix."
  },
  {
    "question": "What's a 'heuristic' in system design?",
    "answer": "It's an 'good enough' solution for a problem that's too complex or expensive to solve perfectly. For example, a cache eviction policy like LRU (Least Recently Used) is a heuristic. It's not *perfect* (the perfect policy would know the future), but it's computationally cheap and works very well in practice. Scalable systems are built on smart heuristics."
  },
  {
    "question": "What's the difference between a CDN and a cache?",
    "answer": "A CDN (Content Delivery Network) *is* a type of cache, but it's one that's globally distributed. Its primary job is to cache *static assets* (images, videos, JS/CSS) and serve them from an edge server *geographically close* to the user. This dramatically reduces latency. A regular cache (like Redis) is typically inside your own datacenter, caching *dynamic data* (like database query results)."
  },
  {
    "question": "How do I handle 'hotspots' in my system?",
    "answer": "A 'hotspot' is a single part of your system taking a disproportionate amount of load (e.g., a viral post, a single over-active user). You first *detect* it (monitoring and metrics). Then you *mitigate* it. This can involve caching at a more aggressive layer, rate-limiting the hot user/key, or even sharding your data more intelligently so the hotkey doesn't overload one server."
  },
  {
    "question": "How do I end the system design interview?",
    "answer": "Don't just stop. Summarize your design and identify its weak points. Say, 'This design handles 1M users, but if we need to scale to 1B, we'd need to re-evaluate the sharding strategy.' Then, discuss *future* work. 'My next steps would be to add a more robust monitoring system and set up alerts for p99 latency.' This shows you think about the full lifecycle of a system, not just the whiteboard."
  },
  {
    "question": "What's the best way to start learning full-stack development?",
    "answer": "Pick one stack and stick with it. Don't try to learn React, Vue, and Svelte at the same time. The MERN stack (MongoDB, Express, React, Node.js) is a great choice because it's all JavaScript. Build a real project, not just a to-do list. Build something with user authentication and a database."
  },
  {
    "question": "React, Vue, or Svelte? I'm overwhelmed by the choice.",
    "answer": "Just pick React. It has the largest job market and the biggest community, meaning more tutorials and help. The core concepts of components, state, and props are transferable. Your first framework isn't your last, but you need to start somewhere."
  },
  {
    "question": "How do I build a portfolio project that actually stands out?",
    "answer": "Solve a real problem, ideally one you personally have. Make it full-stack. Ensure it has user authentication. Deploy it live using a service like Vercel or Railway. A live URL on your resume is ten times more valuable than a GitHub link to an unfinished app."
  },
  {
    "question": "How much LeetCode do I *actually* need for a full-stack job?",
    "answer": "Less than for a pure FAANG backend role, but you can't ignore it. You must know your core data structures. Can you use a Hash Map (or JS object) to avoid a nested loop? Can you filter and map arrays efficiently? Focus on Easy/Medium problems involving arrays, strings, and hash maps. They're 90% of what you'll see."
  },
  {
    "question": "How do I practice LeetCode 'effectively' as a web developer?",
    "answer": "Don't just solve random problems. Focus on patterns. Master 'Two Pointers' for array manipulation and 'Sliding Window' for string problems. Most importantly, practice *explaining* your solution out loud. In an interview, your communication is as important as your code."
  },
  {
    "question": "What's Big-O notation, and does it *really* matter for web dev?",
    "answer": "It's how we measure an algorithm's efficiency. And yes, it matters. It's the difference between a feature that filters 10,000 items instantly and one that freezes the user's browser because you wrote an $O(N^2)$ nested loop in your React component."
  },
  {
    "question": "How do I build a resume for a full-stack role?",
    "answer": "One page. Period. Put your projects front and center, right after your contact info. For each project, use bullet points: 'Built X using [Tech Stack] to achieve Y.' Quantify your results. 'Reduced page load time by 30%' is better than 'Made the site faster.' Link to the live app *and* the GitHub repo."
  },
  {
    "question": "How do I show 'algorithm' skills on a full-stack resume?",
    "answer": "Don't list 'Solved 100 LeetCode problems.' Instead, show the *application*. 'Designed a custom-sorting algorithm for a product catalog, improving search relevance.' or 'Implemented a caching strategy using an LRU policy to reduce database calls by 70%.' Show the impact, not just the knowledge."
  },
  {
    "question": "What's the most common mistake in a full-stack interview?",
    "answer": "Knowing a framework like React but not knowing core JavaScript. I'll ask about the 'this' keyword, `Promise.all` vs. `Promise.race`, or event bubbling. If you can't answer those, I don't care how well you know React hooks. The fundamentals are everything."
  },
  {
    "question": "Should I learn Next.js, or is just React enough?",
    "answer": "Learn React first. Understand state, props, and hooks. But for any *real* project, you'll want a framework like Next.js (or Remix). They give you routing, server-side rendering, and API routes out of the box. It's what the modern web is built on, and it's what companies are hiring for."
  },
  {
    "question": "What's the deal with TypeScript? Is it worth learning?",
    "answer": "Yes. 100%. It's JavaScript with 'types', and it helps you catch countless bugs *before* your code even runs. It's non-negotiable on any serious team or large-scale project. Learn it as soon as you're comfortable with JavaScript."
  },
  {
    "question": "What's the difference between a REST API and GraphQL?",
    "answer": "REST is the traditional approach, like a vending machine with fixed buttons for specific items (e.g., `/api/users/1`). GraphQL lets you ask for *exactly* the data you need in a single request, no more, no less. It's great for preventing the over-fetching and under-fetching problems common with REST."
  },
  {
    "question": "SQL or NoSQL? What database should I learn?",
    "answer": "Start with a SQL database like PostgreSQL. It's the industry standard for structured data. Learn how to write joins and design a basic schema. Most apps *need* structured data. Learn NoSQL (like MongoDB) later to understand its use case (unstructured data, high scalability)."
  },
  {
    "question": "I'm getting a 'take-home' project for an interview. Any tips?",
    "answer": "Read the instructions *perfectly*. Write clean, readable code. Add a simple `README.md` that explains your design choices and how to run the app. Most importantly, *write tests*. Even a few simple unit tests show you're a professional and not just a hobbyist."
  },
  {
    "question": "What's the most common algorithm mistake in a *coding* interview?",
    "answer": "Jumping straight to code. Don't. First, *clarify* the requirements. Ask about edge cases ('What if the array is empty?'). Second, *explain* your high-level approach ('I'll use a hash map to store seen values...'). Third, *then* you write the code."
  },
  {
    "question": "How do I connect my React frontend to my Node.js backend?",
    "answer": "Your backend (Node/Express) will expose API endpoints (e.g., `POST /api/login`). Your frontend (React) will use the `fetch` API or a library like `axios` to make an HTTP request to that endpoint. Remember to handle CORS (Cross-Origin Resource Sharing) on your backend!"
  },
  {
    "question": "What is 'state' vs. 'props' in React?",
    "answer": "This is a core concept. **Props** (properties) are passed *down* from a parent component to a child, like function arguments. They are read-only. **State** is data that a component *owns* and can *change* over time. When state changes, React re-renders the component."
  },
  {
    "question": "How do I handle state management in a big React app? Redux?",
    "answer": "Start with React's built-in tools. Use `useState` for simple component state. Use `useContext` to pass data down without 'prop drilling'. Only reach for a library like Zustand or Redux when you have complex, global state that many unrelated components need to share."
  },
  {
    "question": "What's 'authentication' vs. 'authorization'?",
    "answer": "Authentication is *who you are*. This is the login page. You prove your identity with a username and password. Authorization is *what you're allowed to do*. A regular 'user' can read posts, but an 'admin' can delete them. You're *authorized* to perform specific actions."
  },
  {
    "question": "What's a JWT (JSON Web Token)?",
    "answer": "It's the standard way to handle authentication. After a user logs in, the server gives them a 'token' (a long, signed string). The React app stores this token (in memory or local storage) and sends it with every future API request in the `Authorization` header to prove who they are."
  },
  {
    "question": "I'm self-taught. How do I compete with Computer Science grads?",
    "answer": "With your portfolio. A CS grad has theory; you need to have *proof*. Build 3-4 *excellent*, deployed, full-stack projects. Write a blog post about the hardest bug you fixed. A strong portfolio of real, working apps beats a degree with no projects every single time."
  },
  {
    "question": "What's the best way to handle CSS in a React app?",
    "answer": "Learn plain CSS first, especially Flexbox and Grid. Then, pick a modern solution. **Tailwind CSS** is fantastic for building fast, consistent UIs. If you prefer component-scoped styles, **CSS Modules** or **Styled-Components** are also great. Just avoid mixing all of them."
  },
  {
    "question": "Should I learn Docker?",
    "answer": "Yes. It's not as hard as it looks. Docker solves the 'it works on my machine' problem. It lets you package your app (e.g., your Node.js backend) into a 'container' that runs exactly the same way everywhere, from your laptop to the production server."
  },
  {
    "question": "What's the most important 'soft skill' for a developer?",
    "answer": "Communication. 100%. Can you explain a complex technical problem to a non-technical project manager? Can you write a clear bug report? Can you ask for help *effectively* (showing what you've already tried)? Code is only half the job."
  },
  {
    "question": "What's a 'microservice'?",
    "answer": "It's an architectural style. Instead of building one giant 'monolith' app, you build many small, independent services (e.g., a 'user' service, a 'payment' service) that talk to each other over APIs. It's great for large teams and scalability, but adds complexity."
  },
  {
    "question": "What's the data structure I'll use most in web development?",
    "answer": "Hash Maps. In JavaScript, these are just plain `Objects` or the `Map` class. You will use them *every single day* for quick lookups, caching data, and organizing information. Get really, really good at them."
  },
  {
    "question": "How do I show I'm a 'senior' developer on my resume?",
    "answer": "Show *scope*, *impact*, and *mentorship*. Don't just list tasks. 'Led a team of 3 developers to migrate the main checkout flow to Next.js, resulting in a 50% drop in page load time.' 'Mentored 2 junior engineers on best practices, improving team code quality.' That's senior-level."
  },
  {
    "question": "My 'take-home' project is asking for tests. Where do I even start?",
    "answer": "Don't get overwhelmed. You don't need 100% coverage. Just add a few tests for the most critical logic. For a React component, use React Testing Library to test *user behavior* ('does the button click and show the text?'). For a backend API, use Jest to test your main endpoints ('does `POST /users` actually create a user?')."
  },
  {
    "question": "How do I stay up-to-date? The 'JavaScript fatigue' is real.",
    "answer": "Don't try to learn every new framework. Focus on the fundamentals: JavaScript (ES6+), HTML, CSS, and core CS concepts. Pick one 'ecosystem' (e.g., React/Next.js) and get deep on it. Follow a few good newsletters, but don't feel like you have to *use* everything."
  },
  {
    "question": "What are 'server-side rendering' (SSR) and 'static-site generation' (SSG)?",
    "answer": "By default, React renders in the user's browser (Client-Side Rendering). **SSR** (used by Next.js) renders the React component on the *server* for each request, which is great for SEO and speed. **SSG** (used by Next.js or Gatsby) renders the entire site to static HTML *at build time*, which is incredibly fast. Use SSG for blogs/docs, and SSR for dynamic, user-specific pages."
  }

]