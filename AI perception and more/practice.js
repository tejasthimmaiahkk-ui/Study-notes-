/* Practice MCQs written from the lecture slides (s:"P"). Uses QB_P from qbank.js. */
(function () {
  "use strict";
  var P = window.QB_P;

  /* ----------------------------- WEEK 1 ----------------------------- */
  P(1, "According to the lectures, the success of deep learning is best summarised as:",
    ["Big data + GPUs + neural-network algorithms", "Hand-crafted features + SVM classifiers", "Rule-based expert systems + more memory", "Small datasets + shallow networks"], [0],
    "Lecture 1a: \"Deep Learning success = Big data + GPUs + neural network algorithms\".");
  P(1, "What changed in the ImageNet challenge between 2011 and 2012?",
    ["The number of classes increased from 100 to 1000", "The winning approach switched from hand-crafted visual features to features learned end-to-end from data", "Images were labelled automatically instead of by humans", "Classification was replaced by segmentation"], [1],
    "The paradigm moved from ~50 years of hand-crafted features to learning features and classifier together (end-to-end).");
  P(1, "The McCulloch–Pitts neuron (1943) differs from Rosenblatt's perceptron (1957) mainly because:",
    ["It could not represent AND or OR", "It had no learning algorithm — its weights were set by hand", "It used a sigmoid activation", "It was a multi-layer network"], [1],
    "McCulloch–Pitts gave the mathematical neuron (it can compute AND, OR, NOT); Rosenblatt added a learning rule.");
  P(1, "Which statement about vision–language models (e.g. CLIP) versus ImageNet-pretrained vision-only models matches the lecture?",
    ["VLMs have better in-domain and better out-of-domain performance", "VLMs have better out-of-domain (OOD) performance but lower in-domain performance", "Vision-only models have better OOD performance", "Both behave identically on unseen domains"], [1],
    "CLIP is pre-trained on 400 M image–text pairs → stronger generalisation to unseen domains; vision-only ImageNet models do better in-domain.");
  P(1, "In Haykin's definition, where is the knowledge of a neural network stored?",
    ["In the activation functions", "In the inter-neuron connection strengths (synaptic weights)", "In the training dataset", "In the number of layers"], [1], "Knowledge is acquired through learning and stored in the synaptic weights.");
  P(1, "A neural network loses one neuron and its accuracy drops only slightly. Which property does this illustrate?",
    ["Nonlinearity", "Adaptivity", "Fault tolerance", "Input–output mapping"], [2], "Distributed storage → graceful degradation rather than abrupt failure.");
  P(1, "Which pair correctly contrasts feedforward and feedback networks?",
    ["Feedforward networks have memory; feedback networks do not", "Feedforward: one-directional flow, no memory, easy to train; feedback: cycles, memory of past inputs, used for sequences and control", "Feedback networks are always faster to train", "Feedforward networks are used only for language tasks"], [1], "See the comparison table in 1.4.");
  P(1, "In Tom Mitchell's definition of learning, a drone detector improves its recall after seeing more labelled frames. Which mapping is correct?",
    ["T = recall, P = frames, E = detection", "T = detection task, P = recall, E = labelled frames", "T = labelled frames, P = detection, E = recall", "T = recall, P = detection, E = frames"], [1], "Task T, performance measure P, experience E.");
  P(1, "When does the lecture advise NOT using machine learning?",
    ["When no explicit rule can be written", "When the environment changes continuously", "When rules are clearly defined or the data is biased", "When personalisation is needed"], [2], "If the rules are known, code them; biased data produces biased models.");
  P(1, "Winner-takes-all competitive learning and clustering belong to which paradigm?",
    ["Supervised learning", "Unsupervised learning", "Reinforcement learning", "Transfer learning"], [1], "No labels and no feedback — the network finds structure on its own.");
  P(1, "Which statements about reinforcement learning match the lecture?",
    ["It learns an input–output mapping through continued interaction with an environment", "It uses a reward-driven actor–critic approach", "Its goal is to optimise the cumulative cost (or reward) of actions", "It needs a labelled target for every input"], [0, 1, 2], "The last option describes supervised learning.");
  P(1, "Why does the lecture recommend normalising input data?",
    ["Activations become symmetric, gradients smoother, and saturation is avoided", "It increases the number of training samples", "It removes the need for a validation set", "It turns any distribution into a Gaussian"], [0], "Normalisation (a linear rescaling) cannot change the distribution's shape.");
  P(1, "A wildfire sensor stays silent while the forest is actually burning. This is a:",
    ["True positive", "False positive (Type I error)", "False negative (Type II error)", "True negative"], [2], "Actual positive predicted as negative = a miss = FN = Type II.");
  P(1, "A model has precision 0.5 and recall 1.0. What is its F1 score?",
    ["0.50", "0.67", "0.75", "1.00"], [1], "F1 = 2PR/(P + R) = 2(0.5)(1)/1.5 = 0.667.");
  P(1, "A dataset has 990 negatives and 10 positives. A model predicts \"negative\" for everything. Which is true?",
    ["Accuracy 99 %, recall 0", "Accuracy 99 %, recall 1", "Accuracy 1 %, precision 1", "Accuracy 50 %, F1 0.5"], [0], "TN = 990, FN = 10 → accuracy 0.99 but TP = 0 so recall = 0. Accuracy is misleading on imbalanced data.");
  P(1, "Predictions ŷ = [2, 4, 6] for targets y = [3, 4, 8]. What is the MSE?",
    ["1.00", "1.67", "2.00", "5.00"], [1], "Errors 1, 0, 2 → squares 1, 0, 4 → mean 5/3 = 1.67. (RMSE = 1.29.)");
  P(1, "A regression model has R² = 0. This means:",
    ["It predicts perfectly", "It explains none of the variance — no better than always predicting the mean ȳ", "Its MSE is zero", "It is worse than predicting the mean"], [1], "R² = 1 − SS_res/SS_tot = 0 when SS_res = SS_tot. Negative R² would be worse than the mean.");
  P(1, "Four vectors in ℝ³ are:",
    ["Always linearly independent", "Always linearly dependent", "Independent only if they are orthogonal", "Independent if none of them is zero"], [1], "At most n vectors in ℝⁿ can be independent; any n + 1 must be dependent.");
  P(1, "Vectors v₁ = (1, 2) and v₂ = (2, 4). Which is true?",
    ["They are independent and span ℝ²", "They are dependent; their span is a line through the origin", "They are dependent and span ℝ²", "They are independent; their span is a line"], [1], "v₂ = 2v₁ → 2v₁ − v₂ = 0 (non-trivial) → dependent; together they span only the line along (1, 2).");
  P(1, "X is a 3 × 2 matrix with linearly independent columns. Which is true?",
    ["Xw = b has a solution for every b in ℝ³", "Xw = 0 has only the solution w = 0", "X is invertible", "The rank of X is 3"], [1], "Independent columns ⇒ trivial null space and rank 2; they span only a plane in ℝ³, so not every b is reachable, and a 3 × 2 matrix cannot be inverted.");
  P(1, "Which challenge is specific to slant-angle (long-range) aerial perception, according to the lecture?",
    ["Occlusion and scale change", "Too many labelled samples", "Objects always centred in the image", "Lack of colour channels"], [0], "Also domain shift and missing data.");

  /* ----------------------------- WEEK 2 ----------------------------- */
  P(2, "Which pairing of year and contribution is correct?",
    ["1949 Hebb — first model of synaptic plasticity and unsupervised learning", "1958 Widrow & Hoff — perceptron", "1960 Rosenblatt — delta rule", "1943 Hebb — logical neuron"], [0],
    "1943 McCulloch–Pitts, 1949 Hebb, 1958 Rosenblatt (perceptron, supervised), 1960 Widrow–Hoff (delta rule, error minimisation).");
  P(2, "In the biological neuron, which part receives inputs from other neurons?",
    ["Axon", "Dendrite", "Synapse", "Neurotransmitter"], [1], "Dendrites receive; the axon transmits; the synapse is the junction; neurotransmitters carry the signal across it.");
  P(2, "A neuron uses x₀ = −1 with w = [w₀, w₁, w₂] = [0.5, 1, −2] and input x = [2, 1]. What are v and the bipolar output?",
    ["v = −0.5, y = −1", "v = 0.5, y = 1", "v = −1.5, y = −1", "v = 1.5, y = 1"], [0],
    "v = 0.5(−1) + 1(2) + (−2)(1) = −0.5 → sgn → −1.");
  P(2, "Which statements about the bias are correct?",
    ["It lets the neuron give a non-zero output when all inputs are zero", "It controls the position (shift) of the decision boundary", "It controls the orientation (tilt) of the decision boundary", "It acts like a threshold on the input signal strength"], [0, 1, 3],
    "The weights tilt the hyperplane; the bias shifts it.");
  P(2, "With w = [w₀, w₁, w₂] = [2, 3, 4] and x₀ = −1, how far is the decision boundary from the origin?",
    ["0.4", "0.5", "2", "5"], [0], "Boundary: 3x₁ + 4x₂ = 2. Distance d = w₀/‖w‖ = 2/√(3² + 4²) = 2/5 = 0.4.");
  P(2, "A network uses linear activations in all of its 5 layers. What can it represent?",
    ["Any continuous function", "Only linear mappings — it is equivalent to a single linear layer", "Only XOR", "Any Boolean function"], [1], "A product of matrices is one matrix; nonlinear activations are what add expressive power.");
  P(2, "The derivative of the sigmoid at v = 0 is:",
    ["0", "0.25", "0.5", "1"], [1], "σ(0) = 0.5, σ′ = σ(1 − σ) = 0.25 — its maximum.");
  P(2, "A layer with 2 outputs uses the vectorised Hebbian rule ΔW = ηyxᵀ with η = 0.1, x = [1, 2, −1]ᵀ, y = [1, −1]ᵀ. What is the shape of ΔW and its first row?",
    ["3 × 2; [0.1, −0.1]", "2 × 3; [0.1, 0.2, −0.1]", "2 × 3; [−0.1, −0.2, 0.1]", "1 × 3; [0, 0, 0]"], [1],
    "y (2×1) times xᵀ (1×3) gives 2×3. Row 1 = η·y₁·xᵀ = 0.1 × [1, 2, −1].");
  P(2, "Why is the Hebbian rule called unsupervised?",
    ["It needs labelled data", "Its update uses only the input and the neuron's own output, not the target", "It minimises (d − y)²", "It uses the derivative of the activation"], [1], "Δw = ηyx — d never appears.");
  P(2, "A bipolar perceptron (η = 0.5) misclassifies a sample: d = 1, y = −1, augmented x = [−1, 2, 1]. What is Δw?",
    ["[−1, 2, 1]", "[−0.5, 1, 0.5]", "[1, −2, −1]", "[0, 0, 0]"], [0], "Δw = η(d − y)x = 0.5 × 2 × [−1, 2, 1] = [−1, 2, 1].");
  P(2, "When does the perceptron rule leave the weights unchanged?",
    ["When the sample is classified correctly", "When the learning rate is large", "Only at the first epoch", "Never"], [0], "d − y = 0 → Δw = 0.");
  P(2, "Which Boolean functions can a single perceptron implement?",
    ["AND", "OR", "NAND", "XOR"], [0, 1, 2], "XOR is not linearly separable.");
  P(2, "Which weights/bias implement AND with a unipolar step on inputs in {0, 1} (output 1 when w₁x₁ + w₂x₂ + b > 0)?",
    ["w₁ = w₂ = 1, b = −0.5", "w₁ = w₂ = 1, b = −1.5", "w₁ = w₂ = −1, b = 1.5", "w₁ = w₂ = 1, b = 0.5"], [1],
    "(1,1): 0.5 > 0 → 1; (1,0) or (0,1): −0.5 → 0; (0,0): −1.5 → 0. b = −0.5 gives OR; the third gives NAND.");
  P(2, "How is XOR made learnable by a neural network?",
    ["Use a larger learning rate", "Add a hidden layer (multi-layer perceptron) with nonlinear activations", "Use a bipolar instead of unipolar step", "Train for more epochs"], [1], "A hidden layer can build two lines (e.g. OR and NAND) and combine them with AND.");
  P(2, "A linear neuron (delta/LMS rule) has w = [0.2, 0.4], x = [1, 2], target t = 2, η = 0.1. What is w after one update?",
    ["[0.3, 0.6]", "[0.1, 0.2]", "[0.2, 0.4]", "[0.4, 0.8]"], [0], "y = 0.2 + 0.8 = 1.0; Δw = η(t − y)x = 0.1 × 1 × [1, 2] = [0.1, 0.2] → [0.3, 0.6].");
  P(2, "A tanh neuron has v = 0 (so y = 0), target d = 1, η = 0.1 and augmented x = [−1, 2]. Using the error-reducing gradient-descent update, what is Δw?",
    ["[−0.1, 0.2]", "[0.1, −0.2]", "[0, 0]", "[−0.05, 0.1]"], [0], "g′(0) = 1 − tanh²0 = 1 → Δw = η(d − y)g′(v)x = 0.1 × 1 × 1 × [−1, 2].");
  P(2, "A sigmoid output neuron gives y = 0.8 for target d = 1. Its local gradient δ = (d − y)·y(1 − y) is:",
    ["0.2", "0.16", "0.032", "0.04"], [2], "0.2 × 0.8 × 0.2 = 0.032.");
  P(2, "A hidden neuron has φ′(v) = 0.2 and connects with weight 0.5 to a single output whose local gradient is 0.1. Its local gradient is:",
    ["0.01", "0.05", "0.1", "0.02"], [0], "δ_hidden = φ′(v) Σ w δ_out = 0.2 × 0.5 × 0.1 = 0.01.");
  P(2, "How many trainable parameters (weights + biases) does a fully connected 3 : 4 : 2 MLP have?",
    ["24", "26", "20", "32"], [1], "Input→hidden 3×4 + 4 biases = 16; hidden→output 4×2 + 2 biases = 10; total 26.");
  P(2, "Why does backpropagation need the chain rule for a first-layer weight?",
    ["Because the weight appears in the loss directly", "Because the weight only affects the loss through the later layers' net inputs and activations", "To make the computation numerically stable", "Because activation functions are linear"], [1], "Its influence on E must be propagated through each intermediate transformation.");
  P(2, "Gradient descent on a neural network's error surface is guaranteed to find:",
    ["The global minimum", "A local minimum (not necessarily global)", "A maximum", "The exact solution in one step"], [1], "Non-convex error surfaces have many local minima.");
  P(2, "Which is a valid stopping criterion for backpropagation according to Haykin?",
    ["Absolute rate of change of the average squared error per epoch is small (about 0.1–1 %)", "Number of epochs equals the number of input features", "The weights become all positive", "The learning rate reaches zero"], [0], "Also: small gradient norm; generalisation performance peaked (cross-validation).");
  P(2, "For a 3-class problem with perceptrons, the lecture's approach is to:",
    ["Use one perceptron with three output levels", "Use one perceptron per class, each trained to output 1 for its class and −1 otherwise", "Use XOR gates", "Use Hebbian learning"], [1], "One-vs-rest with multiple perceptrons.");

  /* ----------------------------- WEEK 3 ----------------------------- */
  P(3, "In the lecture's example (linear neuron, x₁ = 1, x₂ = 2, w₁ = w₂ = 0.5, b = 0, d = 0, η = 0.1), what are the weights after one gradient-descent step?",
    ["w₁ = 0.35, w₂ = 0.20", "w₁ = 0.65, w₂ = 0.80", "w₁ = 0.35, w₂ = 0.35", "w₁ = 0.45, w₂ = 0.40"], [0],
    "y = 1.5, ∂L/∂y = −(d − y) = 1.5; ∂L/∂w₁ = 1.5, ∂L/∂w₂ = 3.0 → 0.5 − 0.15 and 0.5 − 0.3.");
  P(3, "Why does that example show a zig-zag path towards an optimum at (0.8, 0.1)?",
    ["Because the learning rate is too large", "Because both inputs are positive, both gradients always share a sign, so the weights can only move together (+/+ or −/−)", "Because the activation is linear", "Because the target is zero"], [1],
    "This is the cost of non-zero-centred inputs — e.g. sigmoid outputs feeding the next layer.");
  P(3, "tanh′(0) is how many times σ′(0)?",
    ["2", "4", "0.25", "1"], [1], "tanh′(0) = 1, σ′(0) = 0.25.");
  P(3, "Gradient descent on J(w) = w² starts at w = 3 with η = 0.1. What is w after one step?",
    ["2.4", "2.7", "3.6", "0"], [0], "J′(3) = 6 → w = 3 − 0.1 × 6 = 2.4.");
  P(3, "Same J(w) = w² from w = 3, but η = 1. What happens?",
    ["Converges in one step", "w jumps to −3, then 3, … — it oscillates forever", "Diverges to infinity quickly", "Stays at 3"], [1], "w ← w − 2w·η = −w. For η > 1 it would diverge; for 0.5 < η < 1 it oscillates but converges.");
  P(3, "With momentum α = 0.5 and η = 1, a constant gradient g = 2 gives updates Δw(1) and Δw(2) of:",
    ["−2 and −2", "−2 and −3", "−2 and −1", "−1 and −1.5"], [1], "Δw(n) = αΔw(n − 1) − ηg: Δw(1) = −2; Δw(2) = 0.5(−2) − 2 = −3.");
  P(3, "For a constant gradient, plain gradient descent steps by ηg. With momentum α = 0.9 the step approaches:",
    ["0.9ηg", "ηg/0.9", "10ηg", "0.1ηg"], [2], "Geometric sum ηg(1 + α + α² + …) = ηg/(1 − α) = 10ηg — acceleration on plateaus.");
  P(3, "In ΔW(n) = Σ α^(n−j) g(j) with α = 0.9, the gradient from two iterations ago has weight:",
    ["0.9", "0.81", "0.729", "1"], [1], "α² = 0.81 (81 % influence).");
  P(3, "Haykin's heuristic: the derivative of the cost w.r.t. a weight keeps alternating sign over iterations. What should you do with that weight's learning rate?",
    ["Increase it", "Decrease it", "Set it to zero", "Leave it unchanged"], [1], "Alternating sign = oscillating across a valley → smaller steps. Same sign for several iterations → increase.");
  P(3, "Which is true of on-line (stochastic) learning compared with batch learning?",
    ["Weights are updated after every example, making the search stochastic", "Weights are updated once per epoch", "It needs more storage than batch learning", "It computes the exact gradient of the total error"], [0], "Batch learning updates once per epoch with an accurate gradient but needs more storage.");
  P(3, "In Bishop's curve-fitting example, the polynomial y(x, w) = Σ wⱼxʲ is:",
    ["Linear in x and nonlinear in w", "Nonlinear in x but linear in the parameters w", "Linear in both", "Nonlinear in both"], [1], "That is why least squares has a closed-form solution.");
  P(3, "As the polynomial degree M increases to 9 (N = 10), what happens to the fitted coefficients w*?",
    ["They shrink towards zero", "They become very large with alternating signs", "They all become equal", "They do not change"], [1], "Large positive and negative coefficients produce the wild oscillations; regularisation shrinks them.");
  P(3, "Which change most directly reduces overfitting of an M = 9 polynomial without changing M?",
    ["Fewer data points", "More data points or a moderate λ", "Larger learning rate", "Removing the bias term"], [1], "N = 100 or ln λ = −18 both give smooth fits.");
  P(3, "The lecture's rule of thumb for the number of training points is roughly:",
    ["Equal to the number of parameters", "5–10 times the number of parameters", "Half the number of parameters", "100 times the number of layers"], [1], "Heuristic from the curve-fitting slides.");
  P(3, "Which regulariser tends to produce sparse weights (many exactly zero)?",
    ["L2", "L1", "Max-norm", "Dropout"], [1], "L1's constant-magnitude gradient pushes small weights to exactly zero; L2 makes them small but non-zero.");
  P(3, "Max-norm regularisation:",
    ["Clamps each neuron's weight vector to ‖w‖₂ < c, typically c ≈ 3–4", "Adds λ‖w‖₁ to the loss", "Drops neurons at random", "Normalises inputs to zero mean"], [0], "Keeps updates bounded even with a too-high learning rate.");
  P(3, "How is dropout applied?",
    ["At training and test time with the same probability", "During training each neuron is kept with probability p (else zeroed); no dropout at test time", "Only at test time", "Only to the output layer"], [1], "Srivastava et al., 2014.");
  P(3, "In 5-fold cross-validation, how many times is the model trained?",
    ["1", "4", "5", "10"], [2], "Each fold is the validation set once; the reported error is the average of the 5.");
  P(3, "During training, the validation error starts rising while the training error keeps falling. This signals:",
    ["Underfitting — train longer", "Overfitting — stop at the validation minimum (early stopping)", "A learning-rate bug", "That the model has converged to the global minimum"], [1], "Early-stopping rule.");
  P(3, "Which three factors does Haykin say influence generalisation?",
    ["Size and representativeness of the training sample", "Architecture of the network", "Physical complexity of the problem", "The colour of the input images"], [0, 1, 2], "");
  P(3, "In y = f(W, x) + εₐ + εₑ, the approximation error εₐ is mainly caused by:",
    ["Limited model capacity (model bias)", "Too few training samples", "Noisy labels", "Class imbalance"], [0], "εₑ (estimation error, variance) comes from limited, noisy or imbalanced data and imperfect optimisation.");
  P(3, "For target d = 1, what are the MLS losses max(0, 1 − yd)² at y = 0.4 and at y = 1.3?",
    ["0.36 and 0", "0.36 and 0.09", "0.6 and 0", "0 and 0.09"], [0], "(1 − 0.4)² = 0.36; 1 − 1.3 < 0 → 0.");
  P(3, "At error e = d − y = 0.1, the LS gradient (∝ 2e) and FPE gradient (∝ 4e³) are:",
    ["0.2 and 0.004", "0.2 and 0.04", "0.1 and 0.001", "Both 0.2"], [0], "FPE's gradient collapses for small errors — vanishing gradient near convergence.");
  P(3, "Focal loss with γ = 2 and outputs in (−1, 1), target d = 1: what is the modulating factor ((1 − y)/2)^γ for an easy sample (y = 0.9) and a hard sample (y = −0.5)?",
    ["0.0025 and 0.5625", "0.05 and 0.75", "0.9 and 0.5", "0.01 and 0.25"], [0], "(0.05)² = 0.0025 vs (0.75)² = 0.5625 — easy samples contribute ~200× less.");
  P(3, "Which loss does the lecture describe as NOT sensitive to finite data and class imbalance, with an adaptive risk that helps convergence?",
    ["Least squares", "Fourth power error", "Risk-sensitive hinge loss", "Binary cross-entropy"], [2], "Suresh et al., 2008 — demonstrated on an imbalanced satellite-image dataset.");
  P(3, "Which loss is described as not guaranteed to achieve the optimal Bayes classifier?",
    ["Least squares", "Cross-entropy", "Focal loss", "Risk-sensitive hinge"], [0], "CE, focal and risk-sensitive hinge are described as consistent towards the optimal Bayes classifier.");

  /* ----------------------------- WEEK 4 ----------------------------- */
  P(4, "What is the rank of a mini-batch of 32 RGB images of size 224 × 224 stored as (N, C, H, W)?",
    ["2", "3", "4", "32"], [2], "Four axes: batch, channel, height, width.");
  P(4, "How many elements does a tensor of shape (2, 3, 4) contain?",
    ["9", "24", "3", "12"], [1], "2 × 3 × 4 = 24.");
  P(4, "A tensor of shape (6, 4) is reshaped to (3, ?). What must ? be?",
    ["2", "4", "8", "12"], [2], "Size stays 24 → 24/3 = 8.");
  P(4, "Which reshape of a (2, 3, 4) tensor is invalid?",
    ["(6, 4)", "(24,)", "(4, 3, 2)", "(5, 5)"], [3], "25 ≠ 24 elements.");
  P(4, "Shapes (3, 1) and (1, 4) are added with broadcasting. The result has shape:",
    ["(3, 4)", "(1, 1)", "(4, 3)", "Error"], [0], "Size-1 axes are stretched to match.");
  P(4, "In a row-major (3, 4) matrix, the element at row 2, column 1 is at flat position:",
    ["9", "6", "7", "5"], [0], "Strides (4, 1): 2 × 4 + 1 × 1 = 9.");
  P(4, "A 3 × 3 matrix whose entries are all 1 has tensor rank ___ and matrix (linear-algebra) rank ___:",
    ["2 and 1", "1 and 2", "2 and 3", "3 and 3"], [0], "Two axes; but all columns are identical → only one independent column.");
  P(4, "For points (1, 2), (2, 3) and a line through the origin y = mx, the least-squares slope m = Σxy/Σx² is:",
    ["1.6", "1.5", "2", "1.4"], [0], "Σxy = 2 + 6 = 8, Σx² = 1 + 4 = 5 → 8/5.");
  P(4, "For data (x, y) = (1, 1), (2, 2), (3, 4), the least-squares line y = mx + c has slope:",
    ["1.0", "1.5", "2.0", "1.33"], [1], "x̄ = 2, ȳ = 7/3; Σ(x − x̄)(y − ȳ) = (−1)(−4/3) + 0 + (1)(5/3) = 3; Σ(x − x̄)² = 2 → m = 1.5, c = 7/3 − 3 = −0.667.");
  P(4, "The normal equations for least squares with design matrix Φ and targets t are:",
    ["Φw = t always solvable", "ΦᵀΦw = Φᵀt", "ΦΦᵀw = t", "w = Φt"], [1], "Setting the gradient of ‖t − Φw‖² to zero. With L2 regularisation: (ΦᵀΦ + λI)w = Φᵀt.");
  P(4, "Why is the mean (raw) error useless for judging a least-squares fit with an intercept?",
    ["It is always negative", "The residuals of the least-squares line always sum to zero", "It is not differentiable", "It ignores the slope"], [1], "Positive and negative errors cancel by construction.");
  P(4, "Errors of two fits: A = (2, 2, 2), B = (0, 0, 5). Which has the smaller SSE, and which has the smaller sum of absolute errors?",
    ["A smaller SSE (12 vs 25); B smaller SAE (5 vs 6)", "B smaller in both", "A smaller in both", "Equal SSE"], [0], "Squaring punishes B's single big error; absolute error does not.");
  P(4, "A Gaussian RBF unit φ(r) = exp(−r²/(2σ²)) has output e^(−0.5) ≈ 0.607 when the distance r equals:",
    ["0", "σ", "2σ", "σ²"], [1], "r = σ → exponent −σ²/(2σ²) = −0.5.");
  P(4, "Increasing the width σ of a Gaussian RBF makes each unit:",
    ["Respond to a narrower region", "Respond to a wider region (smoother)", "Have a higher peak value", "Ignore the centre"], [1], "Peak stays 1; the bump spreads out.");
  P(4, "In an RBF network, which layer is linear?",
    ["Input layer", "Hidden layer", "Output layer", "None"], [2], "Hidden RBF units are nonlinear; the output is a weighted sum, so its weights can be found by linear least squares.");
  P(4, "Typical two-stage training of an RBF network is:",
    ["Backpropagation through all layers only", "Choose centres (e.g. k-means) and widths, then solve output weights by linear least squares", "Hebbian learning of centres only", "Random output weights with trained centres"], [1], "Fast compared with MLP backprop.");
  P(4, "For exact interpolation of N distinct points with Gaussian RBFs centred on the data, Micchelli's theorem guarantees that:",
    ["The interpolation matrix Φ is non-singular, so Φw = d has a unique solution", "The network generalises perfectly", "Only N/2 centres are needed", "The output weights are all equal"], [0], "But exact interpolation also fits the noise.");
  P(4, "Cover's theorem states that a pattern-classification problem cast nonlinearly into a high-dimensional space is:",
    ["Less likely to be linearly separable", "More likely to be linearly separable", "Always impossible to separate", "Unaffected by the mapping"], [1], "The motivation for the RBF hidden layer.");
  P(4, "Compared with an MLP hidden unit, an RBF hidden unit:",
    ["Computes an inner product and responds globally", "Computes a distance to its centre and responds locally", "Has no parameters", "Uses a step activation"], [1], "MLP: wᵀx (global half-space response); RBF: ‖x − c‖ (local bump).");
  P(4, "Which radial basis function increases with distance from the centre?",
    ["Gaussian", "Inverse multiquadric", "Multiquadric √(r² + c²)", "None of them"], [2], "Which is why \"RBF output always increases with distance\" is false — Gaussians decrease.");
})();
