let EigValues = []
let EigVectorsReal = []
let EigVectorsImaginary = []
let potential = []

let psiTotal = []
let totalReal = []
let totalImaginary = []

let paused = false
let collapsed = false
let collapseTo = true
let burst = false
let energy
let audioList = []

let amplitudeScalar = 700

let notesArray = ["C3", "F3", "G3", "A#3", "C4", "G4"]

let t=0

let probabilityArray = [20,2,3,4,5,6]
let amplitudeArray = []
let amplitudePositions = []
let measurementsArray = []

let calculateSum = (array) => {
    let sum = 0
    for (i=0; i<array.length; i++) {
        sum = sum + array[i]
    }
    return sum
}

let normalize = (array) => {
    let sum = calculateSum(array)
    let output = []
    for (i=0; i<array.length; i++) {
        output.push(array[i]/sum)
    }
    return output
}

amplitudeArray = normalize(probabilityArray ,calculateSum(probabilityArray))

let recalculateAmplitudePositions = () => {
    amplitudePositions = []
    let position = 0

    for(let i=0; i<amplitudeArray.length; i++) {
        position = position + amplitudeArray[i]
        amplitudePositions.push(position)
    }
}

let recalculateProbabilities = (inputs) => {
    probabilityArray = []

    for(let i = 0; i < inputs.length; i++) {
        probabilityArray.push(parseFloat(inputs[i].value))
    }

    amplitudeArray = normalize(probabilityArray)
    recalculateAmplitudePositions()
}

let resizeMeasurements = (measurements) => {
    renormalizeInput()
    let measurementsArray = []
    for(let i=0; i<measurements.length; i++) {
        measurementsArray.push(parseFloat(measurements[i].dataset.measurements))
    }
    
    measurementsArray = normalize(measurementsArray)

    let input = []
    document.querySelectorAll(".range-input").forEach((rangeInput) => input.push(parseInt(rangeInput.value)))
    sumInput = calculateSum(input)
    
    for(let i=0; i<measurements.length; i++) {
        measurements[i].style.height = (measurementsArray[i] * sumInput).toString() + "%"
    }
}

let renormalizeInput = () => {
    let input = []
    document.querySelectorAll(".range-input").forEach((rangeInput) => input.push(parseInt(rangeInput.value)))
    sumInput = calculateSum(input)

    document.querySelectorAll(".range-input").forEach((rangeInput) => rangeInput.value = (parseInt(rangeInput.value)*100/sumInput).toString())
}

let resetMeasurements = (measurements) => {
    for(let i=0; i<measurements.length; i++) {
        measurements[i].dataset.measurements = (0).toString()
        measurements[i].style.height = "0%"
    }
}



function setup() {
    createCanvas(windowWidth, windowHeight)
    background(30)
    $(document).ready(function () {

            // setTimeout(() => {
            
                // Use AJAX to load the CSV file content
                $.ajax({
                    url: './Eigvalues.csv',
                    dataType: 'text',
                    success: function (data) {
                        // Parse the CSV content into objects
                        let EigvaluesObject = $.csv.toObjects(data);
                        for(let i = 0; i<Object.keys(EigvaluesObject).length; i++) {
                            EigValues.push(EigvaluesObject[i].Eigvalue)
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Failed to load the CSV file:", error);
                    }
                });

                $.ajax({
                    url: './EigvectorsReal.csv',
                    dataType: 'text',
                    success: function (data) {
                        // Parse the CSV content into objects
                        let EigVectorsRealObject = $.csv.toObjects(data);
                        // console.log(EigVectorsRealObject)
                        let tempArray = []
                        for(let i = 0; i<Object.keys(EigVectorsRealObject).length; i++) {
                            tempArray =[]
                            tempArray.push(EigVectorsRealObject[i].e0)
                            tempArray.push(EigVectorsRealObject[i].e1)
                            tempArray.push(EigVectorsRealObject[i].e2)
                            tempArray.push(EigVectorsRealObject[i].e3)
                            tempArray.push(EigVectorsRealObject[i].e4)
                            tempArray.push(EigVectorsRealObject[i].e5)
                            EigVectorsReal.push(tempArray)
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Failed to load the CSV file:", error);
                    }
                });

                $.ajax({
                    url: './EigvectorsImaginary.csv',
                    dataType: 'text',
                    success: function (data) {
                        // Parse the CSV content into objects
                        let EigVectorsImaginaryObject = $.csv.toObjects(data);
                        // console.log(EigVectorsImaginaryObject)
                        let tempArray = []
                        for(let i = 0; i<Object.keys(EigVectorsImaginaryObject).length; i++) {
                            tempArray =[]
                            tempArray.push(EigVectorsImaginaryObject[i].e0)
                            tempArray.push(EigVectorsImaginaryObject[i].e1)
                            tempArray.push(EigVectorsImaginaryObject[i].e2)
                            tempArray.push(EigVectorsImaginaryObject[i].e3)
                            tempArray.push(EigVectorsImaginaryObject[i].e4)
                            tempArray.push(EigVectorsImaginaryObject[i].e5)
                            EigVectorsImaginary.push(tempArray)
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Failed to load the CSV file:", error);
                    }
                });

                $.ajax({
                    url: './Vpot.csv',
                    dataType: 'text',
                    success: function (data) {
                        // Parse the CSV content into objects
                        let potentialObject = $.csv.toObjects(data);
                        // console.log(EigVectorsImaginaryObject)
                        for(let i = 0; i<Object.keys(potentialObject).length; i++) {
                            potential.push(potentialObject[i].potential * 30)
                        }
                    },
                    error: function (xhr, status, error) {
                        console.error("Failed to load the CSV file:", error);
                    }
                });

            // }, .2)
        
            
    });


    setTimeout(() => {
        console.log(potential)

        psiTotal = []
        totalImaginary = []
        totalReal = []
        let temporaryReal
        let temporaryImaginary

        for(let i=0; i < EigVectorsReal.length; i++) {
            temporaryReal = 0
            temporaryImaginary = 0

            for(let j=0; j<5; j++) {
                temporaryReal += Math.cos(EigValues[j]) * EigVectorsReal[i][j] - Math.sin(EigValues[j])*EigVectorsImaginary[i][j]
                temporaryImaginary += Math.cos(EigValues[j]) * EigVectorsImaginary[i][j] + Math.sin(EigValues[j])*EigVectorsReal[i][j]
            }
            totalReal.push(temporaryReal)
            totalImaginary.push(temporaryImaginary)

            psiTotal.push((amplitudeScalar*temporaryReal**2) + amplitudeScalar*temporaryImaginary**2)
        }

    }, 300)
}



    
function draw() {
    let sliderInputs = []

    for(let i=0; i <EigValues.length; i++) {
        sliderInputs.push(document.getElementById("E" + (i+1).toString()))
    }

    recalculateProbabilities(sliderInputs)


    if(paused==false) {
        let bgColor = color('#F1F1F1')
        background(bgColor)
        translate(-512 + windowWidth/2, windowHeight/2 + 4*windowHeight/32)


        drawingContext.setLineDash([1,4])
        strokeWeight(2)
        stroke(255,255,255)
        for(let i = 0; i<EigValues.length; i++){
            line(0,-30*EigValues[i], 512*2,-30*EigValues[i])
        }

        

        strokeWeight(2)
    
        drawingContext.setLineDash([1])
        stroke(32,115,232)
        // stroke('#333')
        beginShape()
        for(let i = 0; i<potential.length; i++) {
            vertex(i*2, -potential[i])
        }
        endShape()

        drawingContext.setLineDash([1])
        stroke(252,65,32)
        
        noFill()
        strokeWeight(3)
        beginShape()
        for(let i = 0; i< psiTotal.length; i++) {
            vertex(i*2,-psiTotal[i])
        }
        endShape()
       

        

        t += .04
        psiTotal = []
        totalReal = []
        totalImaginary = []
    
        
        
        // reverse loop 
        for(let i=0; i < EigVectorsReal.length; i++) {
            temporaryReal = 0
            temporaryImaginary = 0

            
    
            if(collapsed) { 
                if(collapseTo) {

                    if(burst) {
                        for (let i = 0; i < 4; i ++) {
                            let iterator = 0
                            energy = Math.random()
                            while (energy > amplitudePositions[iterator]) {
                                iterator++
                            }
                            energy = iterator

                            let measurements = document.querySelectorAll(".measurement")

                            measurements[energy].dataset.measurements = ((parseInt(measurements[energy].dataset.measurements)) + 1).toString()
                            resizeMeasurements(measurements)
                        }
                        burst = false
                    }

                    let iterator = 0
                    energy = Math.random()
                    while (energy > amplitudePositions[iterator]) {
                        iterator++
                    }
                    energy = iterator
                    // audioList[energy].play()

                    // const synth = new Tone.PolySynth().toDestination();
                    // const now = Tone.now();
                    // // trigger the attack immediately
                    // synth.triggerAttack(notesArray[0], now);
                    // synth.triggerAttack(notesArray[1], now + .1);
                    // synth.triggerAttack(notesArray[2], now + .11);
                    // synth.triggerAttack(notesArray[3], now + .12);
                    // synth.triggerAttack(notesArray[4], now + .13);
                    // // wait one second before triggering the release
                    // synth.triggerRelease(now + 0.25);

                    // mer enn 6 overtoner


                    let measurements = document.querySelectorAll(".measurement")

                    measurements[energy].dataset.measurements = ((parseInt(measurements[energy].dataset.measurements)) + 1).toString()

                    resizeMeasurements(measurements)
                    collapseTo = false
                }
                // pause loop
                temporaryReal += (Math.cos(EigValues[energy]*t) * EigVectorsReal[i][energy] - Math.sin(EigValues[energy]*t)*EigVectorsImaginary[i][energy])
                temporaryImaginary += (Math.cos( EigValues[energy]*t) * EigVectorsImaginary[i][energy] + Math.sin(EigValues[energy]*t)*EigVectorsReal[i][energy])
            } else { 
                for(let j=0; j<EigValues.length; j++) {
                    // * initial coefficients?
                    temporaryReal += (Math.cos(EigValues[j]*t) * EigVectorsReal[i][j] - Math.sin(EigValues[j]*t)*EigVectorsImaginary[i][j]) * amplitudeArray[j]
                    temporaryImaginary += (Math.cos( EigValues[j]*t) * EigVectorsImaginary[i][j] + Math.sin(EigValues[j]*t)*EigVectorsReal[i][j]) * amplitudeArray[j]
                }
            }
            totalReal.push(temporaryReal)
            totalImaginary.push(temporaryImaginary)
    
            if(collapsed) {
                psiTotal.push((((amplitudeScalar/EigValues.length)*temporaryReal**2) + (amplitudeScalar/EigValues.length)*temporaryImaginary**2) + EigValues[energy] * 30)
            } else {
                psiTotal.push((amplitudeScalar*temporaryReal**2) + amplitudeScalar*temporaryImaginary**2)
            }
        }
    }
}

setTimeout(() => {
    let audioContainer = document.querySelector('.audioContainer')

    let expanded = false
    const expandTerms = document.getElementById("expandTerms")
    const equation = document.getElementById('mf')
    expandTerms.addEventListener('click', () => {
        if(!expanded) {
            equation.value = "\\Psi_{s}=\\alpha_0\\psi_0+\\alpha_1\\psi_1+\\alpha_2\\psi_2+\\alpha_3\\psi_3+\\alpha_4\\psi_4+\\alpha_5\\psi_5"
            expandTerms.innerHTML = "Collect terms"
            equation.classList.add("expanded")
            expanded = !expanded
        } else {
            equation.value = "\\Psi_{s} = \\sum_{i=0}^{5} \\alpha_i \\psi_i"
            expandTerms.innerHTML = "Expand terms"
            equation.classList.remove("expanded")
            expanded = !expanded
        }
    })


    for (let i = 0; i < 6; i++) {
        let audioSrc = './samples' + i.toString() + '.wav'
        let audio = document.createElement('audio')
        audio.src = audioSrc
        audio.id = 'audio' + i.toString()
        audioContainer.appendChild(audio)
        audioList.push(audio)
    }

    // let stopButton = document.getElementById("stop")
    // stopButton.addEventListener('click', function(e){
    //     paused = !paused
    // })

    let resetButton = document.getElementById("reset")
    resetButton.addEventListener('click', function(e){
        resetMeasurements(document.querySelectorAll(".measurement"))
    })

    let stopSVG = document.getElementById("stop")
    let playSVG = document.getElementById("play")
    
    let collapseButton = document.getElementById("collapse")
    collapseButton.addEventListener('click', function(e){
        collapsed = !collapsed

        if(collapsed) {
            collapseTo = true
            stopSVG.style.display="none"
            playSVG.style.display="block"
        } else {
            stopSVG.style.display="block"
            playSVG.style.display="none"
        }
    })

    let burstButton = document.getElementById('burst')
    burstButton.addEventListener('click', function(){
        collapsed = true

        collapseTo = true
        stopSVG.style.display="none"
        playSVG.style.display="block"

        collapseTo = true
        burst = true
    })

    let rangeInputs = document.querySelectorAll(".range-input")

    rangeInputs.forEach((rangeInput) => rangeInput.addEventListener('change', function() {
        resetMeasurements(document.querySelectorAll(".measurement"))
        collapsed = false
        stopSVG.style.display="block"
        playSVG.style.display="none"
    }))
    rangeInputs.forEach((rangeInput) => rangeInput.addEventListener('input', function() {
        if(expanded) {
            equation.value = `\\Psi_{s}=\\sqrt{${amplitudeArray[0].toFixed(2)}}\\psi_0+\\sqrt{${amplitudeArray[1].toFixed(2)}}\\psi_1+\\sqrt{${amplitudeArray[2].toFixed(2)}}\\psi_2+\\sqrt{${amplitudeArray[3].toFixed(2)}}\\psi_3+\\sqrt{${amplitudeArray[4].toFixed(2)}}\\psi_4+\\sqrt{${amplitudeArray[5].toFixed(2)}}\\psi_5`
        }
    }))
}, 400)


