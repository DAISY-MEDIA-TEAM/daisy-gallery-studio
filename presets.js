// DAISY Post Studio — shared data, deployed with the site.
// People fill everything in through the web form; this file is for admins only:
//  - members: a member library available to everyone (typing a name fills in photo + role).
//    Put photos in assets/members/, for example:
//    "Nguyễn Văn A": { role: "Undergraduate, D22", photo: "assets/members/nguyen-van-a.jpg", interest: "Graph learning" },
//  - examples: the sample posts shown the first time someone opens the site.

window.DAISY_PRESET = {
  members: {
  },

  examples: [
    {
      type: "paper",
      venue: { short: "ATC", year: "2026", full: "International Conference on Advanced Technologies for Communications", note: "Oral" },
      papers: [
        { title: "Subject-Independent WGAN-GP Augmentation for Minority-Class ALS Detection in Imbalanced EEG Classification",
          authors: [{ name: "Trần Thị B", role: "Undergraduate, D23" }, { name: "Lê Văn C", role: "PhD student" }],
          advisors: [{ name: "Dr. Nguyễn Văn X", role: "Lecturer" }] },
      ],
    },
    {
      type: "paper",
      venue: { short: "ATC", year: "2026", full: "International Conference on Advanced Technologies for Communications", note: "" },
      papers: [
        { title: "Adaptive Residual-Graph Steiner-Tree Routing for Contended GHZ Multicast in Quantum Networks",
          authors: [{ name: "Lê Văn C", role: "PhD student" }], advisors: [{ name: "Assoc. Prof. Trần Văn Y", role: "Lecturer" }] },
        { title: "RAG-Grounded Graph Attention Networks for Feature Selection in Network Intrusion Detection",
          authors: [{ name: "Nguyễn Văn A", role: "Undergraduate, D22" }, { name: "Phạm Thị D", role: "Undergraduate, D24" }],
          advisors: [{ name: "Dr. Nguyễn Văn X", role: "Lecturer" }] },
        { title: "Subject-Independent WGAN-GP Augmentation for Minority-Class ALS Detection in Imbalanced EEG Classification",
          authors: [{ name: "Trần Thị B", role: "Undergraduate, D23" }, { name: "Hoàng Văn E", role: "Undergraduate, D24" }],
          advisors: [{ name: "Dr. Nguyễn Văn X", role: "Lecturer" }, { name: "Assoc. Prof. Trần Văn Y", role: "Lecturer" }] },
        { title: "Lightweight Graph Learning for Intrusion Detection in Large-Scale IoT Networks",
          authors: [{ name: "Phạm Thị D", role: "Undergraduate, D24" }, { name: "Nguyễn Văn A", role: "Undergraduate, D22" }, { name: "Lê Văn C", role: "PhD student" }],
          advisors: [{ name: "Assoc. Prof. Trần Văn Y", role: "Lecturer" }] },
      ],
    },
    {
      type: "welcome",
      title: "", subtitle: "DAISY Lab welcomes the members joining in Fall 2026.", term: "",
      members: [
        { name: "Nguyễn Văn A", role: "Undergraduate, D22", interest: "Graph learning" },
        { name: "Trần Thị B", role: "Undergraduate, D23", interest: "Biomedical AI" },
        { name: "Phạm Thị D", role: "Undergraduate, D24", interest: "Generative AI" },
        { name: "Hoàng Văn E", role: "Undergraduate, D24", interest: "IoT systems" },
      ],
    },
    {
      type: "event", tag: "DAISY Seminar #01", format: "In person",
      title: "Graph neural networks for network intrusion detection",
      desc: "How GNNs read traffic as a graph, and what our ATC'26 results show.",
      speakers: [{ name: "Lê Văn C", role: "PhD student" }],
      date: "2026-11-05", time: "2:00 – 4:00 PM", place: "Faculty of IT meeting room, PTIT",
    },
    {
      type: "recruit", term: "Fall 2026",
      headline: "Join DAISY Lab",
      intro: "We are looking for students who want to do research on data and intelligent systems.",
      areas: ["Graph learning", "Network security", "Quantum networks", "Biomedical AI", "IoT", "Generative AI"],
      requirements: ["2nd–4th year students in IT, Information Security or Electronics", "Python and a solid maths background", "At least 10 hours a week"],
      contact: "datalab.ptit.edu.vn", deadline: "Nov 30, 2026",
    },
    {
      type: "award", award: "Second Prize", event: "Competition name",
      project: "Software Solution for Intrusion Detection Based on Machine Learning Techniques for IoT Systems",
      members: [{ name: "Nguyễn Đức Minh", role: "Undergraduate" }, { name: "Phạm Văn Thịnh", role: "Undergraduate" }, { name: "Trần Thành Thúy", role: "Undergraduate" }],
      advisors: [],
    },
  ],
};
