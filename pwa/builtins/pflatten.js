"use strict";
// auto-generated by pwa/p2js - part of Phix, see http://phix.x10.mx
//
// builtins\pflatten.e
// ===================
//
//  flatten: Remove all nesting from a sequence.
//  join: Concatenate all elements of a sequence.
//  join_by: Interleave elements of a sequence.
//  join_path: Concatenate all elements of a path.
//

/*global*/ function flatten(/*sequence*/ s, res="") {
    for (let i=1, i$lim=length(s); i<=i$lim; i+=1) {
        let /*object*/ si = $subse(s,i);
        if (atom(si) || string(si)) {
            res = $conCat(res, si);
        } else {
            res = $conCat(res, flatten(si));
        }
    }
    return res;
}

/*global*/ function join(/*sequence*/ s, /*object*/ delim=" ") {
    let /*sequence*/ res = "";
    for (let i=1, i$lim=length(s); i<=i$lim; i+=1) {
        if (i!==1) {
            res = $conCat(res, delim);
        }
        res = $conCat(res, $subse(s,i));
    }
    return res;
}

/*global*/ function join_by(/*sequence*/ s, /*integer*/ step, /*integer*/ n, /*object*/ step_pad="   ", /*object*/ n_pad="\n") {
    let /*sequence*/ res = ["sequence"], js;
    let /*integer*/ nmax = n, 
                    ls = length(s);
    s = deep_copy(s);
    ls += remainder(ls,step);
    while (compare(length(s),step)>=0) {
//  while length(s)>step do     -- (needed for auto-widthwise partial<=step)
        for (let i=1, i$lim=step; i<=i$lim; i+=1) {
            for (let j=1, j$lim=n-1; j<=j$lim; j+=1) {
//              if (j+1)*step<=length(s) then
                if (compare((j+1)*step,ls)<=0) {
                    let /*integer*/ jdx = i+j*step;
                    if (compare(jdx,length(s))>0) { break; }
                    s = $repe(s,i,join(["sequence",$subse(s,i), $subse(s,jdx)],step_pad));
                } else if (nmax===n) {
                    nmax = j;
                }
            }
        }
        js = join($subss(s,1,step),n_pad);
        n = nmax;
//      s = s[step*n+1..$]
        let /*integer*/ sdx = step*n+1;
        s = ((compare(sdx,length(s))>0) ? "" : $subss(s,sdx,-1));
//      if step!=1 or length(s)=0 then js &= n_pad end if
        if (((step!==1) || (equal(length(s),0))) || (equal(length(step_pad),0))) { js = $conCat(js, n_pad); }
        res = append(res,js);
    }
    if (length(s)) {
//      js = join(s,n_pad)
//      if step!=1 then js &= n_pad end if
//      res = append(res,js)
        res = append(res,$conCat(join(s,n_pad), n_pad));
        // auto-widthwise partial<=step:
//      res = append(res,join(s,iff(length(s)<=step?step_pad:n_pad))&n_pad)
    }
//12/10/18:
//  return join(res,n_pad)
    return join(res,((equal(step_pad,"")) ? "" : n_pad));
}

/*global*/ function join_path(/*sequence*/ path_elements, /*integer*/ trailsep=0) {
//integer SLASH = iff(platform()=WINDOWS?'\\':'/')
    let /*string*/ fname = "";
    for (let i=1, i$lim=length(path_elements); i<=i$lim; i+=1) {
        let /*string*/ elem = $subse(path_elements,i);
        if (length(elem) && find($subse(elem,-1),`\\/`)) {
            elem = $subss(elem,1,-1-1);
        }
        if ((length(fname) && length(elem)) && (!equal($subse(elem,1),SLASH))) {
            if ((!equal(platform(),WINDOWS)) || (!equal($subse(elem,-1),0X3A))) {
                elem = $conCat(SLASH, elem);
            }
        }
        fname = $conCat(fname, elem);
    }
    if ((trailsep && length(fname)) && (!equal($subse(fname,-1),SLASH))) {
        fname = $conCat(fname, SLASH);
    }
    return fname;
}