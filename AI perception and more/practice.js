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

  /* ----------------------------- WEEK 5 ----------------------------- */
  P(5, "According to Hubel and Wiesel, simple cells respond to:",
    ["Oriented bars at a specific retinal position", "Any object regardless of position", "Colour only", "Motion only"], [0], "Complex cells respond to the orientation over a range of positions (position-invariant).");
  P(5, "Which list gives the four neuroscience findings the lecture maps onto CNNs?",
    ["Local receptive fields, hierarchical processing, shared weights, spatial pooling", "Dropout, batch norm, residuals, attention", "Recurrence, gating, memory, attention", "Full connectivity, deep supervision, softmax, momentum"], [0], "");
  P(5, "Which is NOT a limitation of fully connected networks for images listed in the lecture?",
    ["Parameter explosion", "No spatial awareness", "The same feature at a new location needs new weights", "They cannot use nonlinear activations"], [3], "FC networks can use any activation.");
  P(5, "In the Neocognitron, learning was:",
    ["Supervised backpropagation", "Unsupervised (competitive learning)", "Reinforcement learning", "Not possible"], [1], "Fukushima, 1980.");
  P(5, "AlexNet's first layer: 227 × 227 input, 11 × 11 filters, stride 4, no padding. Output spatial size?",
    ["55 × 55", "54 × 54", "56 × 56", "57 × 57"], [0], "(227 − 11)/4 + 1 = 55.");
  P(5, "A 7 × 7 input, 3 × 3 filter, stride 2, padding 1. Output size?",
    ["3 × 3", "4 × 4", "5 × 5", "7 × 7"], [1], "⌊(7 + 2 − 3)/2⌋ + 1 = 4.");
  P(5, "How many parameters does a conv layer with 64 filters of 3 × 3 on a 3-channel input have (with biases)?",
    ["576", "1728", "1792", "192"], [2], "64 × (3·3·3 + 1) = 64 × 28 = 1792.");
  P(5, "2 × 2 max pooling with stride 2 on a 32 × 32 × 64 map gives:",
    ["16 × 16 × 64, with 0 parameters", "16 × 16 × 32, with 4 parameters per channel", "32 × 32 × 64", "16 × 16 × 64, with 64 parameters"], [0], "Pooling acts per channel and has no learnable parameters.");
  P(5, "For stride 1 and a 7 × 7 filter, how much zero-padding keeps the output the same size as the input?",
    ["1", "2", "3", "7"], [2], "p = (f − 1)/2 = 3 — the filter's radius.");
  P(5, "Cross-correlate the 1-D signal [1, 2, 3, 4] with kernel [1, 0, −1] (valid, stride 1):",
    ["[−2, −2]", "[2, 2]", "[1, 2, 3]", "[4, 6]"], [0], "1·1 + 2·0 + 3·(−1) = −2; 2·1 + 3·0 + 4·(−1) = −2.");
  P(5, "In the lecture's pooling example, the top-left 2 × 2 window is [[4, 3], [5, 4]]. Its max and average are:",
    ["5 and 4", "4 and 4", "5 and 3.5", "16 and 4"], [0], "Max 5; average (4 + 3 + 5 + 4)/4 = 4.");
  P(5, "Which statement about convolution and pooling is correct?",
    ["Convolution is translation-equivariant (a shifted input gives a shifted feature map); pooling adds local translation invariance", "Convolution is translation-invariant; pooling is equivariant", "Both are nonlinear operations", "Pooling increases spatial precision"], [0], "Pooling loses spatial precision.");
  P(5, "The MNIST dataset contains:",
    ["70,000 grey-scale 28 × 28 images of digits", "60,000 colour 32 × 32 images in 10 classes", "1000 classes of natural images", "21 land-use classes"], [0], "60,000 32 × 32 colour images in 10 classes is CIFAR-10; 21 land-use classes is UC Merced.");
  P(5, "Which challenge of ReLU does the lecture list?",
    ["It saturates for large positive inputs", "Not zero-centred, and no activation/gradient for negative inputs", "It is computationally expensive", "It is not biologically plausible"], [1], "Leaky ReLU (max(0.01x, x)) keeps a small slope for negative inputs.");
  P(5, "Which activation gives outputs close to zero mean and saturates only in the negative region?",
    ["ReLU", "ELU", "Softplus", "Maxout"], [1], "ELU = α(eˣ − 1) for x ≤ 0.");
  P(5, "Softplus log(1 + eˣ) is best described as:",
    ["A smooth approximation of ReLU", "A step function", "Zero-centred like tanh", "A piecewise-linear learned function"], [0], "Maxout is the learned piecewise-linear one.");
  P(5, "A dataset has 60,000 training images and the batch size is 100. How many iterations make one epoch?",
    ["100", "600", "6,000", "60,000"], [1], "Iterations per epoch = dataset size / batch size.");
  P(5, "In a PyTorch training loop, what does optimizer.zero_grad() do?",
    ["Sets the weights to zero", "Clears the accumulated gradients of every parameter before the next backward pass", "Sets the learning rate to zero", "Evaluates the model without gradients"], [1], "loss.backward() adds to .grad; zero_grad() resets it. torch.no_grad() is for evaluation.");
  P(5, "nn.Conv2d(1, 20, 5) creates a layer with:",
    ["1 input channel, 20 output channels (filters), 5 × 5 kernel", "20 input channels, 1 output channel, stride 5", "1 filter of size 20 × 5", "5 input channels and 20 outputs"], [0], "Arguments: in_channels, out_channels, kernel_size.");
  P(5, "A drone model trained on daytime RGB images must work at night and in fog. Which augmentation family helps most?",
    ["Photometric (brightness, contrast, noise, blur)", "Geometric (rotation, scaling)", "None", "Label smoothing"], [0], "Photometric changes mimic illumination, weather and sensor differences; geometric ones mimic viewpoint/altitude changes.");
  P(5, "Why are arbitrary rotations a valid augmentation for top-down drone images of vehicles but not for handwritten digits?",
    ["Vehicles seen from above can point in any direction, so the label is preserved; rotating digits can change their identity (6 ↔ 9)", "Drone images are larger", "Digits are grey-scale", "Rotation is never valid"], [0], "Validity of an augmentation depends on the task semantics.");
  P(5, "You have only 500 labelled aerial images similar to ImageNet scenes. The safest transfer-learning choice is:",
    ["Train from scratch", "Feature extraction: freeze the pre-trained backbone and train a new classifier head", "Fine-tune all layers with a large learning rate", "Use no pre-trained weights"], [1], "Little data → freeze to avoid overfitting; with more data, fine-tune more layers with a small learning rate.");
  P(5, "Why does weight sharing make CNNs data-efficient?",
    ["The same filter is learned once and reused at every position, so far fewer parameters must be estimated", "It increases the number of parameters", "It removes the need for labels", "It makes the network fully connected"], [0], "An inductive bias: a feature useful in one place is useful everywhere.");

  /* ----------------------------- WEEK 6 ----------------------------- */
  P(6, "Input features have very different scales ([0, 1] and [0, 10,000]). What happens to gradient descent, according to the lecture?",
    ["Nothing changes", "The loss landscape becomes elongated and ill-conditioned, giving uneven gradients", "Training becomes faster", "The network becomes linear"], [1], "Normalise so features are centred with comparable variances (Hessian closer to identity).");
  P(6, "Xavier/Glorot initialisation for a layer with fan-in n = 256 sets Var(w) to about:",
    ["1/256 ≈ 0.0039", "256", "1/16", "1"], [0], "Var(y) = n·Var(w)·Var(x) ≈ 1 when Var(w) = 1/n and Var(x) ≈ 1.");
  P(6, "Which problems are caused by internal covariate shift?",
    ["Slower training", "Need for lower learning rates", "Sensitivity to weight initialisation", "Guaranteed overfitting"], [0, 1, 2], "Also vanishing/exploding gradients.");
  P(6, "At inference time, Batch Normalisation uses:",
    ["The statistics of the test mini-batch", "Running averages of mean and variance collected during training, with γ and β frozen", "No normalisation at all", "Layer statistics"], [1], "So BN becomes a fixed linear (affine) operation — and behaves differently from training, a common bug source.");
  P(6, "Group Normalisation with G = 1 group is equivalent to:",
    ["Batch Norm", "Layer Norm", "Instance Norm", "No normalisation"], [1], "G = C gives Instance Norm.");
  P(6, "Which normalisation does NOT depend on the batch size?",
    ["Batch Norm", "Layer Norm", "Instance Norm", "Group Norm"], [1, 2, 3], "Only BN computes statistics across samples.");
  P(6, "In style transfer, \"style\" is mainly carried by:",
    ["The spatial arrangement of edges", "The per-channel mean and standard deviation of feature maps", "The number of layers", "The image resolution"], [1], "Content = spatial structure; style = channel statistics.");
  P(6, "AdaIN(x, y) computes:",
    ["σ(y)·(x − μ(x))/σ(x) + μ(y)", "σ(x)·(y − μ(y))/σ(y) + μ(x)", "(x − μ(x))/σ(x)", "x + y"], [0], "Normalise content features x, then apply style y's channel statistics — style transfer in one forward pass.");
  P(6, "Normalisation perturbation (Fan et al.) is used for:",
    ["Speeding up inference", "Domain generalisation — perturbing channel statistics to simulate style/domain shifts", "Pruning channels", "Computing saliency maps"], [1], "");
  P(6, "With stride-1 3 × 3 convolutions, the receptive field after 4 stacked layers is:",
    ["7 × 7", "9 × 9", "12 × 12", "4 × 4"], [1], "1 + 4 × (3 − 1) = 9.");
  P(6, "Two stacked 3 × 3 convs (C → C channels) vs one 5 × 5 conv: parameters (no bias)?",
    ["18C² vs 25C²", "9C² vs 25C²", "18C² vs 10C²", "Equal"], [0], "Same 5 × 5 receptive field, fewer parameters, one more nonlinearity.");
  P(6, "AlexNet CONV1 gives 55 × 55 × 96. After POOL1 (3 × 3, stride 2) the size and number of parameters are:",
    ["27 × 27 × 96, 0 parameters", "26 × 26 × 96, 864 parameters", "27 × 27 × 48, 0 parameters", "55 × 55 × 96, 0 parameters"], [0], "(55 − 3)/2 + 1 = 27; pooling has no parameters.");
  P(6, "How many parameters (with biases) does VGG's first conv layer (64 filters, 3 × 3, RGB input) have?",
    ["1,728", "1,792", "36,864", "64"], [1], "64 × (3·3·3 + 1) = 1,792 (1,728 without biases, as on the slide).");
  P(6, "ZFNet improved AlexNet's ImageNet top-5 error from about:",
    ["26 % to 16 %", "16.4 % to 11.7 %", "11.7 % to 7.3 %", "3.6 % to 2 %"], [1], "By changing CONV1 to 7 × 7/stride 2 and widening CONV3–5 (512, 1024, 512).");
  P(6, "The three steps of a DeConvNet layer are:",
    ["Unpool, rectify, filter", "Convolve, pool, normalise", "Encode, decode, classify", "Train, validate, test"], [0], "Unpooling uses the recorded max locations (switches); DeConvNets have no learning stage.");
  P(6, "In ZFNet's visualisations, which layer responds to corners and edge/colour conjunctions?",
    ["Layer 1", "Layer 2", "Layer 4", "Layer 5"], [1], "Layer 1: oriented edges/colours; 3: mesh, wheels, text; 4: dog faces, bird legs; 5: whole objects.");
  P(6, "How is a vanilla saliency map (Simonyan et al.) obtained?",
    ["Gradient of the class score with respect to the input pixels, in one backward pass", "By training a second network", "By occluding every pixel", "From the first-layer filters"], [0], "A first-order Taylor approximation of the score around the image.");
  P(6, "In Grad-CAM, the importance weight α_k of feature map k is:",
    ["The global average of ∂yᶜ/∂Aᵏ over the map", "The maximum activation of Aᵏ", "Always 1", "The softmax probability"], [0], "Then L = ReLU(Σ α_k Aᵏ), upsampled.");
  P(6, "Why does Grad-CAM apply a ReLU to the weighted sum of feature maps?",
    ["To keep only features with a positive influence on the target class", "To make the map binary", "To speed up computation", "Because CNNs use ReLU"], [0], "");
  P(6, "Unlike CAM, Grad-CAM:",
    ["Requires global average pooling before the classifier", "Works on many CNN families without changing the architecture", "Needs retraining the network", "Only works for VGG"], [1], "CNNs with FC layers, captioning, VQA, RL.");
  P(6, "Why did GoogLeNet have far fewer parameters than VGG-16?",
    ["It used fewer layers", "Global average pooling instead of large FC layers, plus 1 × 1 bottlenecks", "It shared weights between modules", "It used 7 × 7 convs"], [1], "");
  P(6, "A 1 × 1 convolution reducing a 28 × 28 × 192 map to 64 channels has how many parameters (with biases)?",
    ["12,352", "12,288", "64", "1,204,224"], [0], "192 × 64 + 64.");
  P(6, "ResNet's \"degradation problem\" means that deeper plain networks:",
    ["Overfit (low training error, high test error)", "Have higher training and test error than shallower ones — an optimisation difficulty", "Cannot use ReLU", "Need more GPUs"], [1], "Residual connections make the identity easy to learn.");
  P(6, "Which training choices were used in the original ResNet?",
    ["Batch Norm after every conv", "Xavier initialisation", "No dropout", "Heavy dropout in every layer"], [0, 1, 2], "");
  P(6, "Which fine-tuning option updates the most parameters?",
    ["Freeze backbone, train last FC", "Freeze backbone, train several FC layers", "Fine-tune both backbone and FC layers", "Train nothing"], [2], "");

  /* ----------------------------- WEEK 7 ----------------------------- */
  P(7, "What defines sequential data?",
    ["Data stored in a table", "Data whose element order carries meaning — reordering changes or destroys the information", "Data with many features", "Images only"], [1], "Speech, text, stock prices, sensor streams, video.");
  P(7, "Compared with feedforward networks, recurrent networks:",
    ["Have no stability issues", "Have feedback connections, model dynamical systems and memory, but stability is an issue", "Cannot be trained with gradients", "Only do classification"], [1], "");
  P(7, "A memory neuron has α = 0.3, previous memory v(k − 1) = 0.5 and network output s(k − 1) = 1. What is v(k)?",
    ["0.65", "0.80", "0.35", "0.50"], [0], "v(k) = 0.3 × 1 + 0.7 × 0.5 = 0.65.");
  P(7, "In a Memory Neuron Network, which network neurons have a corresponding memory neuron?",
    ["Only output neurons", "Every network neuron except those in the output layer (output neurons have their own chain feeding the parent)", "Only input neurons", "None"], [1], "Sastry et al., 1994.");
  P(7, "What is the role of the MNN's memory neuron output?",
    ["It stores the class label", "A single scalar summarising the history of past activations of its network neuron", "It sets the learning rate", "It replaces the activation function"], [1], "");
  P(7, "Billings' theorem says a dynamical system's input–output model can be written as:",
    ["y(k+1) = f(y(k), …, y(0), u(k), …, u(0))", "y = Wx + b", "y(k+1) = u(k)", "y = softmax(Vs)"], [0], "With the universal approximation theorem, a network fed past inputs/outputs can identify the system.");
  P(7, "For training a system-identification network, the input signal should be:",
    ["Constant zero", "Persistently exciting (rich enough to reveal the dynamics)", "Random labels", "A single impulse only"], [1], "");
  P(7, "In GPS-denied flight, which sensor is listed for altitude drift correction?",
    ["Magnetometer", "Barometer", "Optical flow", "Thermal camera"], [1], "Magnetometer: heading; optical flow: relative velocity at low altitude.");
  P(7, "Which filter does the lecture list for fusing IMU with other sensors under strong nonlinearity?",
    ["Kalman filter only", "Unscented Kalman Filter", "Median filter", "Sobel filter"], [1], "EKF is the standard choice; UKF for high nonlinearity.");
  P(7, "A vanilla RNN has input size 10, hidden size 20 and output size 5. How many weights are in U, W and V (no biases)?",
    ["700", "725", "350", "620"], [0], "U: 20 × 10 = 200; W: 20 × 20 = 400; V: 5 × 20 = 100. With biases (20 + 5) it would be 725.");
  P(7, "Classifying the action shown in a sequence of video frames is which RNN pattern?",
    ["One-to-one", "One-to-many", "Many-to-one", "Many-to-many"], [2], "Image captioning is one-to-many; video captioning/translation is many-to-many.");
  P(7, "With |W·tanh′| ≈ 0.5 at every step, roughly how much of the gradient survives 10 steps back?",
    ["0.5", "0.1", "about 0.001", "1"], [2], "0.5¹⁰ ≈ 0.00098 — vanishing gradient.");
  P(7, "Which fix is standard for exploding gradients in RNNs?",
    ["Gradient clipping", "Larger learning rate", "Removing the hidden state", "More layers"], [0], "");
  P(7, "A bidirectional RNN is useful when:",
    ["Only past context matters", "Both past and future context help (e.g. filling in a missing word)", "Inputs have fixed length", "There is no sequence"], [1], "");
  P(7, "LSTM step: f = 0.5, C(t−1) = 2, i = 0.8, C̃ = 0.5. What is C(t)?",
    ["1.4", "1.0", "2.4", "0.4"], [0], "0.5 × 2 + 0.8 × 0.5 = 1.4.");
  P(7, "Which LSTM gate decides what to throw away from the cell state?",
    ["Input gate", "Forget gate", "Output gate", "Candidate layer"], [1], "f(t) = σ(W_f[h(t−1), x(t)] + b_f).");
  P(7, "The candidate values C̃(t) in an LSTM use which activation?",
    ["Sigmoid", "tanh", "ReLU", "Softmax"], [1], "Gates use sigmoid (0…1); the candidate uses tanh (−1…1).");
  P(7, "LSTM hidden output h(t) is:",
    ["f(t) · C(t)", "o(t) ⊙ tanh(C(t))", "C(t) + C(t−1)", "σ(C(t))"], [1], "A filtered version of the cell state.");
  P(7, "A GRU differs from an LSTM in that it:",
    ["Has more gates", "Merges forget and input into an update gate and has no separate cell state", "Uses no gates", "Cannot be trained with BPTT"], [1], "Cho et al., 2014.");
  P(7, "In Bahdanau attention, the context vector for output step t is:",
    ["The last encoder hidden state", "c(t) = Σᵢ α(t,i) h(i), with weights recomputed at every decoder step", "The average of all inputs", "The first decoder state"], [1], "");
  P(7, "Attention weights for one query are obtained from scores [2, 0, 0] by softmax. The largest weight is about:",
    ["0.33", "0.50", "0.79", "1.00"], [2], "e² / (e² + 1 + 1) = 7.39 / 9.39 ≈ 0.787.");
  P(7, "Why are attention scores divided by √d_k in the Transformer?",
    ["To make them integers", "Large dot products would push softmax into saturation; scaling keeps gradients stable", "To reduce memory", "To add position information"], [1], "For d_k = 64 the divisor is 8.");
  P(7, "What does multi-head attention provide?",
    ["Several sets of Q/K/V projections, giving multiple representation subspaces", "More layers of RNN", "Positional information", "A single attention map"], [0], "");
  P(7, "Why does a Transformer need positional encoding?",
    ["Self-attention by itself ignores the order of the inputs", "To normalise activations", "To reduce parameters", "To compute gradients"], [0], "");

  /* ----------------------------- WEEK 8 ----------------------------- */
  P(8, "Why can't a plain CNN with a fixed output layer do multi-object detection directly?",
    ["CNNs cannot regress numbers", "Each image needs a different number of outputs (4 numbers per object, and the number of objects varies)", "Softmax cannot handle boxes", "Detection needs RNNs"], [1], "Hence crops/sliding windows, proposals, dense grids or set prediction (DETR).");
  P(8, "What is the IoU of boxes [0, 0, 2, 2] and [1, 1, 3, 3] (x1, y1, x2, y2)?",
    ["0.25", "0.143", "0.5", "0.333"], [1], "Intersection 1; union 4 + 4 − 1 = 7 → 1/7.");
  P(8, "What is the IoU of [0, 0, 4, 4] and [2, 0, 6, 4]?",
    ["0.5", "0.25", "0.333", "0.667"], [2], "Intersection 2 × 4 = 8; union 16 + 16 − 8 = 24 → 1/3.");
  P(8, "In NMS, after picking the highest-scoring box, which boxes are removed?",
    ["All boxes with lower score", "Remaining boxes whose IoU with the selected box exceeds the threshold", "Boxes with IoU below the threshold", "Boxes of other classes"], [1], "Then repeat with the next highest remaining box.");
  P(8, "OverFeat made sliding-window detection efficient by:",
    ["Cropping each window and re-running the CNN", "Reinterpreting fully connected layers as 1 × 1 convolutions so the whole image is scanned in one forward pass", "Using Selective Search", "Using anchors"], [1], "");
  P(8, "Instead of NMS, OverFeat combined its predicted boxes by:",
    ["Discarding all but one", "A greedy merge of the closest-matching boxes (averaging coordinates)", "Random selection", "Bipartite matching"], [1], "");
  P(8, "Selective Search generates proposals by:",
    ["A trained neural network", "Hierarchically merging similar regions of an initial over-segmentation (colour, texture, size, fill)", "Sliding a window at every pixel", "Using anchors"], [1], "It is not learned — one reason R-CNN can't be trained end-to-end.");
  P(8, "In R-CNN, each region proposal is warped to:",
    ["224 × 224", "227 × 227", "32 × 32", "Its original size"], [1], "Regardless of its aspect ratio (AlexNet input).");
  P(8, "Proposal p = (50, 50, 40, 20) and ground truth g = (56, 47, 60, 24) in (cx, cy, w, h). What are t_x and t_w?",
    ["0.15 and log 1.5 ≈ 0.405", "6 and 20", "0.15 and 1.5", "0.3 and 0.405"], [0], "t_x = (56 − 50)/40 = 0.15; t_w = log(60/40) = 0.405.");
  P(8, "Smooth-L1 loss at x = 0.5 and at x = 3:",
    ["0.125 and 2.5", "0.5 and 3", "0.25 and 9", "0.125 and 4.5"], [0], "0.5x² for |x| < 1; |x| − 0.5 otherwise.");
  P(8, "In Fast R-CNN's loss L = L_cls + λ[u ≥ 1]L_box, what does the indicator [u ≥ 1] do?",
    ["Doubles the box loss", "Switches the box loss off for background RoIs (u = 0)", "Selects the class with the highest score", "Normalises the loss"], [1], "");
  P(8, "RoI Align differs from RoI Pooling by:",
    ["Using average instead of max", "Avoiding quantisation — bins keep fractional boundaries and features are sampled by bilinear interpolation", "Using larger output grids", "Removing the backbone"], [1], "Introduced in Mask R-CNN.");
  P(8, "A Faster R-CNN feature map is 40 × 60 with k = 9 anchors per position. How many anchors are evaluated?",
    ["540", "2,400", "21,600", "9"], [2], "40 × 60 × 9.");
  P(8, "For a 512 × 16 × 16 feature map with k anchors, the RPN outputs objectness and box-correction maps of sizes:",
    ["k × 16 × 16 and 4k × 16 × 16", "1 × 16 × 16 and 4 × 16 × 16 only", "512 × 16 × 16 each", "k and 4k scalars"], [0], "Then the top ~300 boxes by objectness are kept.");
  P(8, "Which anchors are ignored when training the RPN?",
    ["IoU > 0.7", "IoU < 0.3", "IoU between 0.3 and 0.7", "The highest-IoU anchor"], [2], "");
  P(8, "Why do two-stage detectors suffer less from foreground–background imbalance than single-stage ones?",
    ["They use bigger backbones", "The proposal stage filters out most background before classification", "They use focal loss", "They ignore background"], [1], "Single-stage detectors classify every anchor — RetinaNet's focal loss addresses this.");
  P(8, "YOLOv1 with S = 7, B = 2 and C = 20 outputs how many numbers per image?",
    ["980", "1,470", "1,078", "2,940"], [1], "7 × 7 × (5·2 + 20) = 7 × 7 × 30 = 1,470.");
  P(8, "In YOLO, a box's confidence score is defined as:",
    ["Pr(class)", "Pr(object) × IoU(pred, truth)", "IoU only", "The softmax of the class"], [1], "");
  P(8, "How does YOLOv2 choose its anchor-box priors?",
    ["Hand-picked like Faster R-CNN", "k-means clustering of training boxes with distance 1 − IoU", "Random", "From ImageNet"], [1], "");
  P(8, "Which is NOT a YOLOv2 change?",
    ["BatchNorm on all conv layers", "Multi-scale training", "DarkNet-19 backbone", "Selective Search proposals"], [3], "YOLO is single-stage — no proposal algorithm.");
  P(8, "SSD handles objects of different sizes by:",
    ["Image pyramids only", "Predicting from several feature maps of decreasing resolution, each responsible for one scale of anchors", "Using RoI pooling", "Using a single grid"], [1], "");
  P(8, "An SSD layer of 10 × 10 with k = 6 anchors and c = 21 classes needs how many 3 × 3 prediction filters (kmn(c + 4))?",
    ["600", "15,000", "2,100", "12,600"], [1], "6 × 10 × 10 × (21 + 4) = 15,000.");
  P(8, "Why does DETR not need non-maximum suppression?",
    ["It predicts only one box", "Bipartite (Hungarian) matching assigns each ground-truth object to exactly one query during training, so duplicates are penalised", "It uses anchors", "It runs at low resolution"], [1], "");
  P(8, "Which challenges are specific to aerial object detection, per the lecture?",
    ["Oriented bounding boxes", "Very large images with many small instances", "Slant-angle viewpoints", "Objects always centred in the frame"], [0, 1, 2], "Also all-weather perception and few-shot/open-vocabulary classes.");

  /* ----------------------------- WEEK 9 ----------------------------- */
  P(9, "Why is semantic segmentation called annotation-intensive?",
    ["Only one label per image is needed", "Every pixel of every training image must be labelled", "It needs bounding boxes", "It needs video"], [1], "");
  P(9, "A 7 × 7 map passes through a transposed conv with K = 4, S = 2, P = 1. Output size?",
    ["14 × 14", "13 × 13", "16 × 16", "12 × 12"], [0], "(7 − 1) × 2 − 2 + 4 = 14.");
  P(9, "Nearest-neighbour unpooling differs from max unpooling because it:",
    ["Uses learned weights", "Copies each value to the whole block, discarding which location was the maximum", "Stores pooling indices", "Shrinks the map"], [1], "");
  P(9, "FCN-8s improves on FCN-32s by:",
    ["Using more FC layers", "Fusing predictions from pool4 and pool3 (skip connections) to recover fine detail", "Using a larger stride", "Removing upsampling"], [1], "");
  P(9, "Two-class confusion matrix (rows = truth) [[8, 2], [1, 9]]. What is the mIoU?",
    ["0.739", "0.850", "0.727", "0.800"], [0], "IoU₁ = 8/(8 + 1 + 2) = 0.727; IoU₂ = 9/(9 + 2 + 1) = 0.75; mean 0.739.");
  P(9, "If a class has IoU = 0.5, its Dice coefficient is:",
    ["0.25", "0.5", "0.667", "1.0"], [2], "Dice = 2·IoU/(1 + IoU) = 1/1.5.");
  P(9, "Why can pixel accuracy be misleading?",
    ["It ignores the background", "Large classes (e.g. background) dominate it, hiding poor performance on small classes", "It is always lower than mIoU", "It cannot be computed from a confusion matrix"], [1], "mIoU weighs every class equally.");
  P(9, "COCO-style AP averages over how many IoU thresholds?",
    ["1", "5", "10 (0.50 to 0.95 in steps of 0.05)", "100"], [2], "");
  P(9, "What does SegNet transfer from encoder to decoder?",
    ["Full feature maps (concatenated)", "Only the max-pooling indices", "Nothing", "The class scores"], [1], "Memory-efficient; U-Net transfers and concatenates full feature maps.");
  P(9, "U-Net's weighted cross-entropy puts extra weight on:",
    ["Background pixels", "Pixels in the thin gaps between touching objects (and on rare classes)", "Image corners", "The first layer"], [1], "w(x) = w_c(x) + w₀·exp(−(d₁ + d₂)²/(2σ²)).");
  P(9, "PSPNet's pyramid pooling module with levels 1 × 1, 2 × 2, 3 × 3, 6 × 6 produces how many bins per channel?",
    ["12", "50", "36", "4"], [1], "1 + 4 + 9 + 36.");
  P(9, "PSPNet's total training loss is:",
    ["Only the final cross-entropy", "L_main + α·L_aux — an auxiliary loss on an intermediate backbone layer (deep supervision)", "Dice only", "Focal + Dice"], [1], "");
  P(9, "A 3 × 3 atrous convolution with rate r = 4 has an effective kernel size of:",
    ["7 × 7", "9 × 9", "12 × 12", "3 × 3"], [1], "k + (k − 1)(r − 1) = 3 + 2 × 3 = 9, still 9 weights.");
  P(9, "Atrous convolution's main advantage is:",
    ["Fewer channels", "A larger field of view without more parameters, computation or downsampling", "Faster training only", "Removing the need for labels"], [1], "");
  P(9, "Atrous separable convolution in DeepLabv3+ combines:",
    ["Max pooling and unpooling", "A dilated depthwise convolution with a pointwise (1 × 1) convolution", "Two 3 × 3 convs", "A transformer and a CNN"], [1], "");
  P(9, "What does DeepLabv3+ add to DeepLabv3?",
    ["An ASPP module", "A decoder that fuses upsampled encoder output with low-level features to refine boundaries", "Fully connected layers", "Anchors"], [1], "Upsample ×4, concatenate with 1 × 1-reduced low-level features, two 3 × 3 convs, upsample ×4.");
  P(9, "In an undercomplete network with pooling factor 2, what is the receptive field of conv block 3 on the input?",
    ["k × k", "2k × 2k", "4k × 4k", "(¼)k × (¼)k"], [2], "2^(2(i−1)) k × k area → side 4k at i = 3; an overcomplete network gives ¼k.");
  P(9, "In MaskFormer, the extra class ∅ is used for:",
    ["Background pixels only", "Predicted masks that do not correspond to any region (\"no object\")", "Boundary pixels", "Ignored labels"], [1], "");
  P(9, "How is each binary mask computed in MaskFormer?",
    ["Argmax of pixel logits", "Sigmoid of the dot product between a segment's mask embedding and the per-pixel embeddings", "Thresholding the input image", "By RoI Align"], [1], "");
  P(9, "The SA-1B dataset used to train SAM contains about:",
    ["1.1 million masks from 11 million images", "1.1 billion masks from 11 million images", "11 billion masks from 1 million images", "1,000 classes"], [1], "Class-agnostic masks produced by a 3-stage data engine.");
  P(9, "How does SAM's prompt encoder handle a free-form text prompt?",
    ["With a CNN", "With CLIP's text encoder", "It cannot use text", "As a dense mask"], [1], "Points/boxes → positional encodings + learned embeddings; masks → convolutions.");
  P(9, "What is usually fine-tuned when adapting SAM to a new domain?",
    ["The whole image encoder", "Only the lightweight mask decoder", "Only the prompt encoder", "Nothing can be fine-tuned"], [1], "Easier, faster, more memory-efficient.");
  P(9, "Panoptic segmentation:",
    ["Only labels pixels with classes", "Unifies semantic segmentation (stuff) and instance segmentation (things)", "Only detects boxes", "Only works on video"], [1], "");
  P(9, "Feature distribution P(x) changes between training and test while P(y | x) stays the same. This is:",
    ["Label shift", "Covariate shift", "Concept shift", "No shift"], [1], "Label shift: P(y) changes; concept shift: P(y | x) changes.");
  P(9, "A segmentation model must use only SAR images at inference although EO, IR and SAR were available during training. This is the:",
    ["Missing-modality problem", "Label-shift problem", "Overfitting problem", "Anchor problem"], [0], "SpaceNet 6 MSAW setting.");
  /* ---------- Week 10 ---------- */
  P(10, "Every time a softmax is placed at the end of a network, the output is:",
    ["A set of unnormalised scores", "A probability distribution over the classes", "A one-hot vector", "A density over the input space"], [1], "Softmax outputs are non-negative and sum to 1, so they form a PMF over classes. They are only one-hot in the limit of very confident logits.");
  P(10, "Classification and generative modelling, in the distribution view, model respectively:",
    ["P(x) and P(y | x)", "P(y | x) and P(x)", "P(y) and P(x | y)", "P(x, y) and P(y)"], [1], "Classification models the label distribution given the input; generative models model the data itself.");
  P(10, "Cross-entropy H(P<sub>data</sub>, P<sub>θ</sub>) equals:",
    ["D<sub>KL</sub>(P<sub>θ</sub>‖P<sub>data</sub>)", "D<sub>KL</sub>(P<sub>data</sub>‖P<sub>θ</sub>) + H(P<sub>data</sub>)", "D<sub>KL</sub>(P<sub>data</sub>‖P<sub>θ</sub>) − H(P<sub>θ</sub>)", "H(P<sub>data</sub>) − H(P<sub>θ</sub>)"], [1], "Since H(P<sub>data</sub>) does not depend on θ, minimising cross-entropy is the same as minimising this KL.");
  P(10, "For P = [0.5, 0.5] and Q = [0.9, 0.1], D<sub>KL</sub>(P‖Q) in nats is closest to:",
    ["0.368", "0.511", "0", "0.693"], [1], "0.5·ln(0.5/0.9) + 0.5·ln(0.5/0.1) = −0.294 + 0.805 = 0.511. The reverse, D<sub>KL</sub>(Q‖P), is 0.368: KL is not symmetric.");
  P(10, "Which statements about Maximum Mean Discrepancy (MMD) are correct? (Select all that apply)",
    ["It is symmetric", "It is defined even when the supports of P and Q do not overlap", "It needs explicit densities, not just samples", "It compares mean embeddings in a Reproducing Kernel Hilbert Space"], [0, 1, 3], "MMD² = ‖E[φ(x)] − E[φ(y)]‖² in an RKHS. It needs only samples, which is its advantage over KL.");
  P(10, "KL divergence is said to be ineffective when:",
    ["The distributions are identical", "The two distributions have very little overlap", "The distributions are discrete", "The temperature is above 1"], [1], "Where Q → 0 but P &gt; 0, log(P/Q) blows up. KL also needs absolute continuity. MMD and Wasserstein remain meaningful in that case.");
  P(10, "Teacher logits [2, 1, 0.1]. With temperature T = 1 the softmax is ≈ [0.659, 0.242, 0.099]. With T = 2 it becomes approximately:",
    ["[0.867, 0.117, 0.016]", "[0.502, 0.304, 0.194]", "[0.333, 0.333, 0.333]", "[0.659, 0.242, 0.099]"], [1], "softmax([1, 0.5, 0.05]) = [0.502, 0.304, 0.194]. A higher T flattens the distribution and reveals how the teacher ranks the wrong classes. Option A is what you get by sharpening (T = 0.5).");
  P(10, "As the distillation temperature T → ∞, the softened teacher distribution tends to:",
    ["One-hot on the top class", "Uniform over all classes", "The ground-truth label", "Zero for every class"], [1], "z/T → 0 for every logit, so all exponentials → 1 and the softmax → 1/K. Very large T washes out the information; moderate T is used.");
  P(10, "Why is the KL distillation term usually multiplied by T²?",
    ["To make the loss symmetric", "The gradients of soft targets scale as 1/T², so T² keeps their magnitude comparable to the hard-label loss", "To convert nats to bits", "To prevent the student from overfitting the hard labels"], [1], "Hinton et al.: soft-target gradients scale as 1/T²; multiplying by T² keeps the relative contribution stable when T is changed.");
  P(10, "In the teacher–student framework, which of these can the student be trained to match? (Select all that apply)",
    ["Output logits (soft targets)", "Intermediate feature activations", "Attention maps", "Input-gradient maps ∂L/∂x"], [0, 1, 2, 3], "The lecture lists logits, intermediate features (with a linear map to match dimensions, as in FitNets), attention maps and gradients.");
  P(10, "When the student's intermediate feature map has a different number of channels from the teacher's, FitNets-style hints:",
    ["Cannot be used", "Apply a learned linear transformation (regressor) to match dimensions before comparing", "Compare only the output logits", "Average both maps to a scalar first"], [1], "A linear transformation is applied to match dimensions, then the features are compared.");
  P(10, "Attention-transfer observation: Network-in-Network (62%), ResNet-34 (73%), ResNet-101 (77.3%). Which trend in their activation attention maps was reported?",
    ["Weaker networks have sharper peaks", "Stronger (more accurate) networks have sharper attention peaks on the objects", "All three have identical maps", "Attention maps are uncorrelated with the objects"], [1], "Activation statistics correlate spatially with the predicted objects, and the correlation is stronger in more accurate networks. That is why the attention maps are worth transferring.");
  P(10, "InfoNCE with one positive of similarity 0.8, three negatives of similarity 0.2 and temperature τ = 0.1. The loss is closest to:",
    ["0.0074", "0.973", "1.386", "0.693"], [0], "Positive term e<sup>8</sup> = 2981; each negative e<sup>2</sup> = 7.39. Loss = −ln(2981/(2981 + 22.2)) = 0.0074. With τ = 1 it would be 0.973. A small τ sharpens the contrast.");
  P(10, "If an encoder is untrained and gives every candidate the same similarity, the InfoNCE loss with K candidates (1 positive + K−1 negatives) equals:",
    ["0", "1", "ln K", "K"], [2], "The softmax gives 1/K to the positive, so the loss is −ln(1/K) = ln K. For K = 8 that is 2.08. This is the chance-level value to beat.");
  P(10, "In SimCLR, which statements are correct? (Select all that apply)",
    ["Two augmentations t, t′ from the same family produce two correlated views", "The contrastive (NT-Xent) loss is applied after the projection head g(·)", "The representation h = f(x) from the encoder is kept for downstream tasks; g is discarded", "It needs only very small batches"], [0, 1, 2], "SimCLR relies on large batches to get many negatives; MoCo was designed to remove that dependence.");
  P(10, "MoCo decouples the number of negatives from the batch size by:",
    ["Using no negatives at all", "Keeping a queue of past key embeddings encoded by a momentum-averaged encoder", "Using pixel-level labels", "Increasing the temperature"], [1], "The queue acts as a large dictionary of negatives. The momentum encoder (θ<sub>k</sub> ← mθ<sub>k</sub> + (1−m)θ<sub>q</sub>) keeps the queued keys consistent.");
  P(10, "In Contrastive Multiview Coding, the critic h<sub>θ</sub>(·) is trained to:",
    ["Reconstruct view 2 from view 1", "Give high scores to congruent (same-scene) view pairs and low scores to incongruent pairs", "Classify the scene into labelled classes", "Predict the BN scaling factors"], [1], "Two encoders f<sub>θ1</sub>, f<sub>θ2</sub> embed the two views, and the critic discriminates positive from negative pairs. Different spectral bands can serve as views.");
  P(10, "For pixel-level contrastive learning, \"semi-hard\" example sampling collects for each anchor:",
    ["All pixels of the same image", "The top 10% nearest negatives and the 10% farthest positives from the memory bank", "Random pixels only", "Only the single hardest negative"], [1], "Hardest sampling takes the top-K hardest negatives and positives; semi-hard takes the 10% nearest negatives and 10% farthest positives. A memory bank supplies negatives beyond the mini-batch.");
  P(10, "In multi-spectral (RGB–IR) networks, modality-specific, high-frequency information is mainly associated with:",
    ["Shallow convolutional layers", "Deeper layers and the BatchNorm layers", "The input normalisation only", "The loss function"], [1], "Low-frequency, modality-shared features sit in shallow and convolutional layers; high-frequency, modality-specific features sit in deeper and BatchNorm layers. This motivates shared convs with separate BNs.");
  P(10, "A key drawback of Multi-Modal Image Fusion (e.g. PIAFusion, CDDFuse) for drone perception is that it:",
    ["Needs no training", "Cannot handle sensor failure (missing modality) and does not exploit modality-shared/specific features in training", "Works only on IR images", "Always outperforms feature fusion"], [1], "It builds one fused image from both sensors, so a missing sensor breaks the pipeline.");
  P(10, "In the Channel Exchange Network (CEN):",
    ["Each modality has its own convolution weights and a shared BatchNorm", "Convolution weights are shared, BatchNorm is modality-specific, and channels with BN γ below a threshold are replaced by the other modality's channel at the same position", "Channels with the largest γ are exchanged", "Low-γ channels are deleted permanently"], [1], "CEN is alignment-based feature fusion built on the pruning idea that a small γ means little impact. Deleting low-γ channels would be pruning, not exchange.");
  P(10, "Directly forcing alignment between modality-specific features of modalities with a large domain gap tends to cause:",
    ["Positive transfer", "Negative transfer", "Zero change", "Faster convergence only"], [1], "This is why OGP-Net adds DUR to preserve modality-specific representations.");
  P(10, "OGP-Net's DMC module combines which three ingredients?",
    ["Pruning, quantisation, distillation", "Feature exchange, pixel-level knowledge distillation, multi-view contrastive learning", "Data augmentation, dropout, weight decay", "RPN, RoI Align, NMS"], [1], "DMC maps semantics from both modalities into a unified latent space as multi-view feature maps and applies contrastive learning to them. DUR preserves modality-specific features.");
  P(10, "OGP-Net ablation: the best configuration was:",
    ["Unshared conv, shared BN, no exchange", "Shared conv, unshared BN, with feature exchange", "Shared conv, shared BN, no exchange", "Unshared everything"], [1], "This follows the channel-exchange philosophy: shared low-frequency filters and modality-specific BN statistics.");
  P(10, "In continual learning, tasks with the same label space but different input distributions (e.g. the same classes in day → night → fog) form:",
    ["Task-Incremental Learning", "Domain-Incremental Learning", "Class-Incremental Learning", "Instance-Incremental Learning"], [1], "DIL: same labels, shifting inputs. TIL and CIL have disjoint label spaces.");
  P(10, "Task identities are provided during training but NOT at test time, and tasks have disjoint label spaces. This is:",
    ["TIL", "CIL", "TFCL", "IIL"], [1], "Class-Incremental: the model must choose among all classes seen so far without being told the task. TIL gives the task ID at test; TFCL never gives it.");
  P(10, "In the continual-learning objective p(D<sub>1:k</sub> | θ) = Π<sub>t</sub> p(D<sub>t</sub> | θ), the central difficulty is that:",
    ["The product is not differentiable", "When learning task k, the old datasets D<sub>1</sub> … D<sub>k−1</sub> are inaccessible", "Tasks always share labels", "θ must be frozen"], [1], "Training only on D<sub>k</sub> lets the new task overwrite what the old ones needed: catastrophic forgetting.");
  P(10, "According to the lecture, a balanced continual-learning solution generalises better across the task sequence when the converged loss landscape is:",
    ["Sharper", "Flatter", "Non-convex", "Discontinuous"], [1], "Flat minima tolerate the parameter drift caused by later tasks.");
  P(10, "In open-vocabulary semantic segmentation (OVSS), which statements hold? (Select all that apply)",
    ["Candidate classes are described in natural language", "The number of candidate classes N can change at inference", "The model may face classes it never saw during training", "The class set must be fixed at training time"], [0, 1, 2], "A fixed class set is the closed-set setting. OVSS typically uses CLIP backbones and is evaluated out of domain on MESS.");
  P(10, "Visual Prompt Tuning (VPT) adapts a frozen vision–language model by:",
    ["Fine-tuning all backbone weights", "Injecting trainable prompt tokens into the visual encoder's input sequence across Transformer layers", "Changing the text vocabulary", "Pruning attention heads"], [1], "Parameter-efficient fine-tuning: only the small set of task-specific tokens is learned. Text prompt learning instead learns context vectors for the word embeddings.");
  /* ---------- Week 11 ---------- */
  P(11, "A drone receives rewards R<sub>1</sub> = 1, R<sub>2</sub> = 2, R<sub>3</sub> = 3 and then the episode ends. With γ = 0.5, the return G<sub>0</sub> is:",
    ["6", "2.75", "3.5", "1.75"], [1], "G = 1 + 0.5·2 + 0.25·3 = 1 + 1 + 0.75 = 2.75.");
  P(11, "A task gives a constant reward of 2 at every step forever, with γ = 0.8. The return is:",
    ["∞", "10", "2.5", "1.6"], [1], "Geometric series: 2/(1 − 0.8) = 10. Discounting (γ &lt; 1) keeps infinite sums finite.");
  P(11, "With γ = 0 the agent:",
    ["Values all future rewards equally", "Considers only the immediate reward", "Cannot learn", "Ignores the immediate reward"], [1], "G<sub>t</sub> = R<sub>t+1</sub>: completely myopic. γ → 1 is far-sighted.");
  P(11, "Which tuple defines a Markov Decision Process?",
    ["(S, A, P, R, γ)", "(X, Y, θ, L)", "(G, D, z)", "(Q, K, V)"], [0], "States, actions, transition probabilities P(s′ | s, a), reward R(s, a) and discount γ.");
  P(11, "A drone's next position depends on its current pose, velocity and commanded thrust, but not on how it got there. This is:",
    ["The reward hypothesis", "The Markov property", "The Bellman optimality principle", "Experience replay"], [1], "The future depends only on the current state and action. That is why the state should include velocity, not just position.");
  P(11, "Which statements about policies are correct? (Select all that apply)",
    ["A deterministic policy maps each state to one action, a = π(s)", "A stochastic policy gives a distribution π(a | s)", "Stochastic policies help exploration and are central to policy-gradient methods", "A policy maps actions to rewards"], [0, 1, 2], "A policy maps states to actions (or action probabilities); rewards come from the environment.");
  P(11, "If Q(s, a) is known exactly for every action in state s, the optimal action is:",
    ["argmin<sub>a</sub> Q(s, a)", "argmax<sub>a</sub> Q(s, a)", "a random action", "the action with the largest immediate reward"], [1], "A value function quietly defines a policy. The largest immediate reward ignores the future.");
  P(11, "The Bellman equation expresses the value of a state as:",
    ["The sum of all past rewards", "Immediate reward + discounted value of the next state", "The maximum reward ever seen", "The average reward of a random policy"], [1], "V(s) = E[R + γV(s′)]; the optimal form uses max<sub>a′</sub> Q*(s′, a′).");
  P(11, "ε-greedy with ε = 0.1 over 5 actions. The probability of choosing the greedy action is:",
    ["0.90", "0.92", "0.10", "0.02"], [1], "(1 − 0.1) + 0.1/5 = 0.92. Each non-greedy action gets 0.02.");
  P(11, "Q-learning: Q(s, a) = 4, r = 2, α = 0.2, γ = 0.5, max<sub>a′</sub> Q(s′, a′) = 6. The new Q(s, a) is:",
    ["4.2", "5.0", "3.7", "4.0"], [0], "Target = 2 + 0.5·6 = 5; TD error = 1; Q = 4 + 0.2·1 = 4.2.");
  P(11, "Same numbers as before, but the agent uses SARSA and the next action actually taken has Q(s′, a′) = 1. The new Q(s, a) is:",
    ["4.2", "3.7", "4.5", "3.0"], [1], "Target = 2 + 0.5·1 = 2.5; TD error = −1.5; Q = 4 − 0.3 = 3.7. SARSA's target uses the action it really takes.");
  P(11, "In Q(s, a) ← Q(s, a) + α[r + γ max Q(s′, ·) − Q(s, a)], the bracketed quantity is called the:",
    ["TD target", "TD error", "Return", "Advantage"], [1], "r + γ max Q(s′, ·) alone is the TD target; subtracting the current estimate gives the TD error.");
  P(11, "Temporal-difference learning is described as \"bootstrapping\" and \"model-free\" because it: (Select all that apply)",
    ["Updates a guess from a slightly better guess after each step", "Needs the transition probabilities P(s′ | s, a)", "Learns purely from sampled experience", "Waits for the end of the episode to compute the full return"], [0, 2], "TD does not need the dynamics and updates after every step, unlike Monte-Carlo methods that wait for the full return.");
  P(11, "Near a cliff with ε-greedy exploration, which algorithm learns the safer path one row away from the edge?",
    ["Q-learning", "SARSA", "Both learn the edge path", "Neither can learn a path"], [1], "SARSA (on-policy) includes its own exploratory slips in its values. Q-learning (off-policy) learns the optimal edge path but falls more during training.");
  P(11, "Why is a Q-table impractical for a real drone? (Select all that apply)",
    ["Position, velocity and thrust are continuous, giving infinitely many states", "Camera images are extremely high-dimensional", "A table cannot generalise to unseen but similar states", "Tables cannot store negative values"], [0, 1, 2], "This is the curse of dimensionality; function approximation with neural networks fixes it.");
  P(11, "In DQN, experience replay helps because it:",
    ["Uses only the most recent transition", "Breaks the correlation between consecutive samples and reuses past data", "Removes the need for rewards", "Makes the policy on-policy"], [1], "Random mini-batches from a buffer; possible because Q-learning is off-policy. The target network θ⁻ is the second stabiliser.");
  P(11, "The DQN target network:",
    ["Is updated every step identically to the online network", "Is a slowly updated copy that provides stable Bellman targets", "Chooses the exploration actions", "Is the discriminator"], [1], "It stops the network chasing its own constantly moving targets.");
  P(11, "Dueling DQN splits the network into two streams estimating:",
    ["Actor and critic", "The state value V(s) and each action's advantage", "Generator and discriminator", "Reward and discount"], [1], "Q(s, a) = V(s) + A(s, a) (with a normalisation).");
  P(11, "Why are policy-gradient methods attractive for drone control?",
    ["They require discrete actions", "They output a distribution over continuous thrust/attitude commands and sample from it", "They need no reward", "They have no variance"], [1], "Value-based argmax is awkward for continuous actions. Policy gradients suffer from high variance, which actor–critic reduces.");
  P(11, "In an actor–critic method:",
    ["The critic chooses actions and the actor evaluates them", "The actor (policy) chooses actions and the critic (value function) evaluates them, often via the advantage", "Both networks generate images", "There is no value function"], [1], "Advantage = how much better than average the action was. This gives lower variance than pure policy gradients.");
  P(11, "Match the algorithm to its key idea: PPO",
    ["Adds an entropy bonus to maximise both reward and action randomness", "Limits how much the policy can change per update for stable, monotonic improvement", "Uses a Q-table", "Uses a queue of negatives"], [1], "SAC is the entropy-regularised off-policy method.");
  P(11, "In Gymnasium, env.step(action) returns:",
    ["obs, info", "obs, reward, terminated, truncated, info", "reward only", "policy, value"], [1], "env.reset() returns (obs, info).");
  P(11, "Randomising mass, wind, sensor noise and delays in the simulator while training a drone policy is called:",
    ["Reward shaping", "Domain randomisation", "Experience replay", "Mode collapse"], [1], "It forces a robust policy that transfers zero-shot from simulation to real hardware.");
  P(11, "Dense rewards (distance-to-goal, smoothness, energy) compared with a sparse +1 at the goal typically:",
    ["Learn slower", "Learn faster", "Make no difference", "Prevent any exploration"], [1], "This is reward shaping: more frequent feedback gives a stronger learning signal.");
  P(11, "At some x, p<sub>data</sub>(x) = 0.3 and p<sub>G</sub>(x) = 0.1. The optimal discriminator output D*(x) is:",
    ["0.25", "0.75", "0.5", "0.3"], [1], "D* = 0.3/(0.3 + 0.1) = 0.75: the point is three times more likely to be real.");
  P(11, "With the optimal discriminator, the GAN value function becomes:",
    ["KL(p<sub>data</sub> ‖ p<sub>G</sub>)", "2·JSD(p<sub>data</sub>, p<sub>G</sub>) − log 4", "W(p<sub>data</sub>, p<sub>G</sub>)", "−log D"], [1], "Its minimum −log 4 ≈ −1.386 is reached when p<sub>G</sub> = p<sub>data</sub>.");
  P(11, "At the GAN's global optimum, D(x) equals:",
    ["1 for all x", "0 for all x", "½ for all x", "p<sub>data</sub>(x)"], [2], "p<sub>G</sub> = p<sub>data</sub>, so D* = p/(p + p) = ½. Real and fake are indistinguishable.");
  P(11, "With D = σ(a) and generator loss log(1 − D), ∂L/∂a = −D. When D(G(z)) = 0.01, the generator's gradient magnitude is about:",
    ["0.99", "0.01", "1", "100"], [1], "It vanishes. The non-saturating loss −log D gives −(1 − D) = −0.99 instead.");
  P(11, "Which are remedies or responses to mode collapse? (Select all that apply)",
    ["Minibatch discrimination", "Switching to a Wasserstein objective", "Training the discriminator with only one real image", "Unrolled GANs"], [0, 1, 3], "Minibatch discrimination lets D see the similarity of samples within a batch; WGAN and unrolled GANs improve training dynamics.");
  P(11, "In a WGAN, the discriminator (critic):",
    ["Outputs a probability through a sigmoid", "Outputs an unconstrained scalar score and must be 1-Lipschitz", "Is removed", "Is trained with cross-entropy"], [1], "The Lipschitz constraint is enforced by weight clipping or a gradient penalty.");
  P(11, "Two distributions are shifted so far that they no longer overlap. Which statement is correct?",
    ["JSD keeps growing with the shift", "JSD is stuck at log 2 while the Wasserstein distance keeps growing with the shift", "Both are zero", "Wasserstein is undefined"], [1], "This is the core WGAN motivation: a useful gradient even without overlap.");
  P(11, "Which are DCGAN design rules? (Select all that apply)",
    ["Strided convolutions instead of pooling in D; strided transposed convolutions in G", "BatchNorm in both G and D", "ReLU in G with Tanh output; LeakyReLU in D", "Large fully connected hidden layers"], [0, 1, 2], "DCGAN removes fully connected hidden layers.");
  P(11, "In pix2pix (a conditional GAN mapping edges → photos), the discriminator judges:",
    ["Only the generated photo", "{edge map, photo} pairs, so both G and D see the input edge map", "Only the edge map", "Latent vectors"], [1], "Conditioning both networks ties the output to the given input; CycleGAN handles unpaired data.");
})();
