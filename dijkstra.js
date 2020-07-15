class Graph {
  constructor({ adjacencyMatrix, labels }) {
    // 인접 행렬을 map으로 변환
    this.nodeMap = adjacencyMatrix.reduce((node, row, rowIndex) => {
      node[labels[rowIndex]] = row.reduce(
        (adjacencyNode, weight, cellIndex) => {
          if (weight) {
            adjacencyNode[labels[cellIndex]] = weight;
          }
          return adjacencyNode;
        },
        {}
      );
      return node;
    }, {});

    // 메소드 바인딩
    this.setRouteUseDijkstra = this.setRouteUseDijkstra.bind(this);
    this.getRoute = this.getRoute.bind(this);
  }

  setRouteUseDijkstra(entryLabel, destinationLabel) {
    // 초기화: 방문해야할 노드 Infinty, 시작 노드 0
    const remainingNode = Object.keys(this.nodeMap).reduce(
      (accumulatorRemainingNode, label) => {
        accumulatorRemainingNode[label] = Infinity;
        return accumulatorRemainingNode;
      },
      {}
    );
    remainingNode[entryLabel] = 0;
    this.route = {};

    while (true) {
      // 시작점부터 각 노드까지의 "가중치가 가장 작은 노드" 선택
      const minimumNode = Object.entries(remainingNode).reduce(
        (currentMinimumNode, node) => {
          const currentMinimumNodeWeight = currentMinimumNode[1];
          const weight = node[1];

          return currentMinimumNodeWeight <= weight ? currentMinimumNode : node;
        }
      );
      const [minimumNodeLabel, minimumNodeWeight] = minimumNode;

      // 선택된 "가중치가 가장 작은 노드" 방문해야할 노드에서 제거
      delete remainingNode[minimumNodeLabel];

      if (
        destinationLabel
          ? minimumNodeLabel === destinationLabel
          : !Object.keys(remainingNode).length
      ) {
        return this.route;
      }

      // 방문해야할 노드에 속해있으면서 "가중치가 가장 작은 노드"에 인접한 노드들 선택
      const adjacencyNode = this.nodeMap[minimumNodeLabel];
      const filteredAdjacencyNodeLabels = Object.keys(
        adjacencyNode
      ).filter((adjacencyNodeLabel) =>
        remainingNode.hasOwnProperty(adjacencyNodeLabel)
      );

      // 인접한 노드들 순회하며 방문해야할 노드에서 자신의 가중치 업데이트
      filteredAdjacencyNodeLabels.forEach((label) => {
        const weight = remainingNode[label];
        const newWeight = minimumNodeWeight + adjacencyNode[label];
        if (weight > newWeight) {
          remainingNode[label] = newWeight;
          this.route[label] = {
            accumulatorWeight: newWeight,
            previousNodeLabel: minimumNodeLabel,
          };
        }
      });
    }
  }

  getRoute(destinationLabel) {
    const totalWeight = this.route[destinationLabel].accumulatorWeight;
    const routeLabels = [];

    // 경로 역산
    while (true) {
      routeLabels.unshift(destinationLabel);
      const previousNode = this.route[destinationLabel];
      if (!previousNode) {
        break;
      }

      destinationLabel = previousNode.previousNodeLabel;
    }

    return {
      totalWeight,
      routeLabels,
    };
  }
}

const graph = new Graph({
  adjacencyMatrix: [
    [0, 4, 3, 0, 0, 0, 0, 0],
    [4, 0, 2, 5, 0, 0, 0, 0],
    [3, 2, 0, 3, 6, 0, 0, 0],
    [0, 5, 3, 0, 1, 5, 0, 0],
    [0, 0, 6, 1, 0, 0, 5, 0],
    [0, 0, 0, 5, 0, 0, 2, 7],
    [0, 0, 0, 0, 5, 2, 0, 4],
    [0, 0, 0, 0, 0, 7, 4, 0],
  ],
  labels: ["a", "b", "c", "d", "e", "f", "g", "z"],
});

const routeNode = graph.setRouteUseDijkstra("a", "z");
console.log("a를 시작점 z를 종점으로 설정하여 구한 최단 경로");
console.log(routeNode);

console.log("----------------------------------");
const route = graph.getRoute("z");
console.log(`a 부터 z까지의 총 가중치: ${route.totalWeight}`);
console.log(`a 부터 z까지의 경로: ${route.routeLabels}`);
