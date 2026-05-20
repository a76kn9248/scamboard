export const shameMessages = [
  "Another day, another rug. Stay frosty degens.",
  "If you're on this list, your mom is disappointed.",
  "Eat dirt, scamboy.",
  "Get bent, you absolute carpet.",
  "Imagine rugging people and thinking you're cool.",
  "This scammer's wallet is emptier than their soul.",
  "Certified rug merchant. Handle with disgust.",
  "Your code is as bad as your morals.",
  "Even your smart contract is embarrassed.",
  "Somewhere, a village is missing its scammer.",
  "Professional money disappearing act. No applause.",
  "You didn't just pull the rug, you burned the whole house down.",
  "Scamming degens? In THIS economy?",
  "Tell me you have no friends without telling me you have no friends.",
  "L + ratio + rugged + no liquidity + touch grass",
  "This person's exit strategy was their entire personality.",
  "Congrats, you played yourself. And everyone else.",
  "Not even your deployer address wants to be associated with you.",
  "The blockchain remembers. So do we.",
  "You can run but the explorer is forever.",
  "Certified clown. Circus left town but they stayed.",
  "If scamming was an Olympic sport, you'd still choke.",
  "Your tokenomics were just 'take money and run.'",
  "Rug so hard even the floor is gone.",
  "Wallet address: known. Reputation: destroyed. Hotel: Trivago.",
  "This rug was so fast it broke the sound barrier.",
  "Plot twist: the real utility was the friends we scammed along the way.",
  "Your whitepaper was just a napkin that said 'lol.'",
  "Deploying contracts and deploying disappointment since day one.",
  "You're not a dev, you're a disappearing act.",
  "The only thing transparent about you is your greed.",
  "Your roadmap led straight to your own wallet.",
  "Liquidity? Gone. Dignity? Never had it.",
  "The only thing you're building is a criminal record.",
  "Your community called. They want their money back.",
] as const;

export function getRandomShameMessage(): string {
  return shameMessages[Math.floor(Math.random() * shameMessages.length)];
}

export function getShameMessageByIndex(index: number): string {
  return shameMessages[index % shameMessages.length];
}
