import axios from "axios";

export const getRandomProblem = async (rating, tag) => {
    const res = await axios.get("https://codeforces.com/api/problemset.problems");

    const problems = res.data.result.problems;
    let filtered;

    // Filter by rating and tag (unless tag is 'all')
    if (!tag || tag === "all") {
        filtered = problems.filter(p =>
            p.rating === rating
        );
    }
    else {
        filtered = problems.filter(p =>
            p.rating === rating &&
            (p.tags.includes(tag))
        );
    }


    if (filtered.length === 0) {
        throw new Error("No matching problem found");
    }

    const randomIndex = Math.floor(Math.random() * filtered.length);
    const selected = filtered[randomIndex];

    return {
        name: `${selected.contestId}${selected.index}: ${selected.name}`,
        url: `https://codeforces.com/problemset/problem/${selected.contestId}/${selected.index}`,
        contestId: selected.contestId,
        index: selected.index
    };
};
